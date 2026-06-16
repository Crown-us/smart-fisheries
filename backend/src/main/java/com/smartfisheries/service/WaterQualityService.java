package com.smartfisheries.service;

import com.smartfisheries.dto.WaterQualityDto;
import com.smartfisheries.entity.*;
import com.smartfisheries.exception.BadRequestException;
import com.smartfisheries.exception.ResourceNotFoundException;
import com.smartfisheries.mapper.WaterQualityMapper;
import com.smartfisheries.repository.PondRepository;
import com.smartfisheries.repository.PondStockRepository;
import com.smartfisheries.repository.UserRepository;
import com.smartfisheries.repository.WaterQualityRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterQualityService {

    private final WaterQualityRecordRepository recordRepository;
    private final PondRepository pondRepository;
    private final PondStockRepository pondStockRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final WaterQualityMapper mapper;

    @Transactional
    public WaterQualityDto.WaterQualityResponse recordWaterQuality(Long farmerId, Long pondId, WaterQualityDto.WaterQualityRequest request) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this pond");
        }

        User recordedBy = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WaterQualityRecord record = WaterQualityRecord.builder()
                .pond(pond)
                .ph(request.ph())
                .temperature(request.temperature())
                .dissolvedOxygen(request.dissolvedOxygen())
                .salinity(request.salinity())
                .ammonia(request.ammonia())
                .notes(request.notes())
                .recordedBy(recordedBy)
                .recordedAt(request.recordedAt())
                .build();

        WaterQualityRecord savedRecord = recordRepository.save(record);

        // Check alerts asynchronously/proactively based on active stock in this pond
        checkWaterQualityAlerts(pond, record);

        return mapper.toResponse(savedRecord);
    }

    @Transactional
    public WaterQualityDto.WaterQualityResponse simulateIotData(Long farmerId, Long pondId, String mode) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this pond");
        }

        // Get the active stock for this pond to find the species
        PondStock stock = pondStockRepository.findFirstByPondIdAndStatusOrderByStockedAtDesc(pond.getId(), PondStockStatus.ACTIVE)
                .orElse(null);

        // Default optimal limits if no stock
        double phMin = 6.5, phMax = 8.5;
        double tempMin = 25.0, tempMax = 30.0;
        double doMin = 4.0;
        double salinityMin = 0.0, salinityMax = 10.0;
        double ammoniaMax = 0.05;

        if (stock != null) {
            FishSpecies species = stock.getFishSpecies();
            if (species.getOptimalPhMin() != null) phMin = species.getOptimalPhMin();
            if (species.getOptimalPhMax() != null) phMax = species.getOptimalPhMax();
            if (species.getOptimalTempMin() != null) tempMin = species.getOptimalTempMin();
            if (species.getOptimalTempMax() != null) tempMax = species.getOptimalTempMax();
            if (species.getOptimalDoMin() != null) doMin = species.getOptimalDoMin();
            if (species.getOptimalSalinityMin() != null) salinityMin = species.getOptimalSalinityMin();
            if (species.getOptimalSalinityMax() != null) salinityMax = species.getOptimalSalinityMax();
            if (species.getOptimalAmmoniaMax() != null) ammoniaMax = species.getOptimalAmmoniaMax();
        }

        double ph, temp, dissolvedOxygen, salinity, ammonia;
        String notes;

        if ("ALERT".equalsIgnoreCase(mode)) {
            // Generate values that trigger warnings
            ph = Math.random() < 0.5 ? (phMin - 0.8) : (phMax + 0.8);
            temp = Math.random() < 0.5 ? (tempMin - 3.0) : (tempMax + 3.0);
            dissolvedOxygen = doMin - 1.5; // dangerously low DO
            salinity = salinityMax + 5.0; // too high
            ammonia = ammoniaMax + 0.08; // toxic level
            notes = "Simulasi IoT: Terdeteksi kondisi bahaya kualitas air!";
        } else {
            // Generate normal values within range
            ph = phMin + (phMax - phMin) * (0.3 + 0.4 * Math.random());
            temp = tempMin + (tempMax - tempMin) * (0.3 + 0.4 * Math.random());
            dissolvedOxygen = doMin + 1.0 + 3.0 * Math.random();
            salinity = salinityMin + (salinityMax - salinityMin) * (0.2 + 0.6 * Math.random());
            ammonia = ammoniaMax * 0.3 * Math.random();
            notes = "Simulasi IoT: Parameter air normal terkirim secara otomatis.";
        }

        // Round values
        ph = Math.round(ph * 100.0) / 100.0;
        temp = Math.round(temp * 10.0) / 10.0;
        dissolvedOxygen = Math.round(dissolvedOxygen * 10.0) / 10.0;
        salinity = Math.round(salinity * 10.0) / 10.0;
        ammonia = Math.round(ammonia * 1000.0) / 1000.0;

        User recordedBy = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WaterQualityRecord record = WaterQualityRecord.builder()
                .pond(pond)
                .ph(ph)
                .temperature(temp)
                .dissolvedOxygen(dissolvedOxygen)
                .salinity(salinity)
                .ammonia(ammonia)
                .notes(notes)
                .recordedBy(recordedBy)
                .recordedAt(LocalDateTime.now())
                .build();

        WaterQualityRecord savedRecord = recordRepository.save(record);

        // Check and create in-app alerts/notifications
        checkWaterQualityAlerts(pond, record);

        return mapper.toResponse(savedRecord);
    }


    private void checkWaterQualityAlerts(Pond pond, WaterQualityRecord record) {
        pondStockRepository.findFirstByPondIdAndStatusOrderByStockedAtDesc(pond.getId(), PondStockStatus.ACTIVE)
                .ifPresent(stock -> {
                    FishSpecies species = stock.getFishSpecies();
                    List<String> warnings = new ArrayList<>();

                    // 1. pH alert
                    if (species.getOptimalPhMin() != null && record.getPh() < species.getOptimalPhMin()) {
                        warnings.add(String.format("pH level is too low (%.2f < %.2f)", record.getPh(), species.getOptimalPhMin()));
                    } else if (species.getOptimalPhMax() != null && record.getPh() > species.getOptimalPhMax()) {
                        warnings.add(String.format("pH level is too high (%.2f > %.2f)", record.getPh(), species.getOptimalPhMax()));
                    }

                    // 2. Temp alert
                    if (species.getOptimalTempMin() != null && record.getTemperature() < species.getOptimalTempMin()) {
                        warnings.add(String.format("Temperature is too low (%.2f°C < %.2f°C)", record.getTemperature(), species.getOptimalTempMin()));
                    } else if (species.getOptimalTempMax() != null && record.getTemperature() > species.getOptimalTempMax()) {
                        warnings.add(String.format("Temperature is too high (%.2f°C > %.2f°C)", record.getTemperature(), species.getOptimalTempMax()));
                    }

                    // 3. DO alert (critical for fish survival!)
                    if (species.getOptimalDoMin() != null && record.getDissolvedOxygen() < species.getOptimalDoMin()) {
                        warnings.add(String.format("Dissolved Oxygen is dangerously low (%.2f mg/L < %.2f mg/L)", record.getDissolvedOxygen(), species.getOptimalDoMin()));
                    }

                    // 4. Salinity alert
                    if (species.getOptimalSalinityMin() != null && record.getSalinity() < species.getOptimalSalinityMin()) {
                        warnings.add(String.format("Salinity is too low (%.2f ppt < %.2f ppt)", record.getSalinity(), species.getOptimalSalinityMin()));
                    } else if (species.getOptimalSalinityMax() != null && record.getSalinity() > species.getOptimalSalinityMax()) {
                        warnings.add(String.format("Salinity is too high (%.2f ppt > %.2f ppt)", record.getSalinity(), species.getOptimalSalinityMax()));
                    }

                    // 5. Ammonia alert (highly toxic!)
                    if (species.getOptimalAmmoniaMax() != null && record.getAmmonia() > species.getOptimalAmmoniaMax()) {
                        warnings.add(String.format("Ammonia level is toxic (%.3f mg/L > %.3f mg/L)", record.getAmmonia(), species.getOptimalAmmoniaMax()));
                    }

                    // Trigger in-app warning notification if any threshold exceeded
                    if (!warnings.isEmpty()) {
                        String alertTitle = "Water Quality Alarm - " + pond.getName();
                        String alertMessage = "Threshold breaches detected: " + String.join("; ", warnings) + ". Please take action immediately!";
                        notificationService.createNotification(pond.getFarmer(), alertTitle, alertMessage, NotificationType.ALERT);
                    }
                });
    }

    public WaterQualityDto.WaterQualityResponse getLatestCondition(Long farmerId, Long pondId) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("Access denied: You do not own this pond");
        }

        List<WaterQualityRecord> records = recordRepository.findByPondIdOrderByRecordedAtDesc(pondId);
        if (records.isEmpty()) {
            throw new ResourceNotFoundException("No water records found for this pond");
        }

        return mapper.toResponse(records.get(0));
    }

    public List<WaterQualityDto.WaterQualityResponse> getHistoricalRecords(Long farmerId, Long pondId, int days) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("Access denied: You do not own this pond");
        }

        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(days);

        return recordRepository.findByPondIdAndRecordedAtBetweenOrderByRecordedAtAsc(pondId, start, end).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public void deleteRecord(Long farmerId, Long recordId) {
        WaterQualityRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Record not found"));

        if (!record.getPond().getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own the pond for this record");
        }

        recordRepository.delete(record);
    }
}
