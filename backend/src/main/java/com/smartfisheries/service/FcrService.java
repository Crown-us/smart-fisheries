package com.smartfisheries.service;

import com.smartfisheries.dto.FcrDto;
import com.smartfisheries.entity.FcrRecord;
import com.smartfisheries.entity.PondStock;
import com.smartfisheries.entity.WaterQualityRecord;
import com.smartfisheries.exception.BadRequestException;
import com.smartfisheries.exception.ResourceNotFoundException;
import com.smartfisheries.repository.FcrRecordRepository;
import com.smartfisheries.repository.FeedingRecordRepository;
import com.smartfisheries.repository.PondStockRepository;
import com.smartfisheries.repository.WaterQualityRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FcrService {

    private final FcrRecordRepository fcrRecordRepository;
    private final PondStockRepository pondStockRepository;
    private final FeedingRecordRepository feedingRecordRepository;
    private final WaterQualityRecordRepository waterQualityRecordRepository;

    @Transactional
    public FcrRecord calculateAndSaveFcr(Long stockId) {
        PondStock stock = pondStockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock batch not found"));

        // 1. Calculate Total Feed Given in KG
        Double totalFeedGivenKg = feedingRecordRepository.sumQuantityByPondStockId(stockId);
        if (totalFeedGivenKg == null) {
            totalFeedGivenKg = 0.0;
        }

        // 2. Calculate Biomass Gain
        // Biomass = Quantity * Weight (grams converted to kg)
        double initialBiomassKg = stock.getInitialQuantity() * (stock.getInitialWeightG() * 0.001);
        double currentBiomassKg = stock.getCurrentQuantity() * (stock.getCurrentWeightG() * 0.001);
        double totalBiomassGainKg = currentBiomassKg - initialBiomassKg;

        // FCR calculation validation
        double fcrValue = 0.0;
        if (totalBiomassGainKg > 0) {
            fcrValue = totalFeedGivenKg / totalBiomassGainKg;
        }

        // Round FCR to 2 decimal places
        fcrValue = Math.round(fcrValue * 100.0) / 100.0;

        // 3. Find if today's record exists; if so, update it. Otherwise create a new one.
        LocalDate today = LocalDate.now();
        List<FcrRecord> existingRecords = fcrRecordRepository.findByPondStockIdOrderByCalculationDateDesc(stockId);
        FcrRecord todayRecord = existingRecords.stream()
                .filter(r -> r.getCalculationDate().equals(today))
                .findFirst()
                .orElse(null);

        if (todayRecord != null) {
            todayRecord.setTotalFeedGivenKg(totalFeedGivenKg);
            todayRecord.setTotalBiomassGainKg(totalBiomassGainKg);
            todayRecord.setFcrValue(fcrValue);
            return fcrRecordRepository.save(todayRecord);
        } else {
            FcrRecord newRecord = FcrRecord.builder()
                    .pondStock(stock)
                    .calculationDate(today)
                    .totalFeedGivenKg(totalFeedGivenKg)
                    .totalBiomassGainKg(totalBiomassGainKg)
                    .fcrValue(fcrValue)
                    .build();
            return fcrRecordRepository.save(newRecord);
        }
    }

    public List<FcrDto.FcrRecordResponse> getFcrHistory(Long farmerId, Long stockId) {
        PondStock stock = pondStockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock batch not found"));

        if (!stock.getPond().getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("Access denied: You do not own this pond stock");
        }

        return fcrRecordRepository.findByPondStockIdOrderByCalculationDateDesc(stockId).stream()
                .map(record -> new FcrDto.FcrRecordResponse(
                        record.getId(),
                        record.getPondStock().getId(),
                        record.getCalculationDate(),
                        record.getTotalFeedGivenKg(),
                        record.getTotalBiomassGainKg(),
                        record.getFcrValue(),
                        record.getCreatedAt()
                ))
                .toList();
    }

    public FcrDto.FcrReportResponse getFcrReport(Long farmerId, Long stockId) {
        PondStock stock = pondStockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock batch not found"));

        if (!stock.getPond().getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("Access denied: You do not own this pond stock");
        }

        // Force recalculation to ensure fresh data
        FcrRecord currentRecord = calculateAndSaveFcr(stockId);

        double initialWeightKg = stock.getInitialWeightG() * 0.001;
        double currentWeightKg = stock.getCurrentWeightG() * 0.001;

        return new FcrDto.FcrReportResponse(
                stock.getId(),
                stock.getFishSpecies().getName(),
                stock.getInitialQuantity(),
                stock.getCurrentQuantity(),
                initialWeightKg,
                currentWeightKg,
                currentRecord.getTotalBiomassGainKg(),
                currentRecord.getTotalFeedGivenKg(),
                currentRecord.getFcrValue(),
                currentRecord.getCalculationDate()
        );
    }

    @Transactional
    public FcrDto.AiForecastResponse getAiForecast(Long farmerId, Long stockId) {
        PondStock stock = pondStockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock batch not found"));

        if (!stock.getPond().getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("Access denied: You do not own this pond stock");
        }

        // Get current FCR
        FcrRecord currentRecord = calculateAndSaveFcr(stockId);
        double currentFcr = currentRecord.getFcrValue();

        // Get latest water records to determine pond health
        List<WaterQualityRecord> waterRecords = waterQualityRecordRepository.findByPondIdOrderByRecordedAtDesc(stock.getPond().getId());
        
        // Calculate average values from recent records
        double avgPh = 7.2;
        double avgTemp = 28.0;
        double avgDo = 5.2;
        double avgAmmonia = 0.01;
        
        if (!waterRecords.isEmpty()) {
            int count = Math.min(waterRecords.size(), 7);
            double sumPh = 0;
            double sumTemp = 0;
            double sumDo = 0;
            double sumAmmonia = 0;
            for (int i = 0; i < count; i++) {
                WaterQualityRecord r = waterRecords.get(i);
                sumPh += r.getPh();
                sumTemp += r.getTemperature();
                sumDo += r.getDissolvedOxygen();
                sumAmmonia += r.getAmmonia();
            }
            avgPh = sumPh / count;
            avgTemp = sumTemp / count;
            avgDo = sumDo / count;
            avgAmmonia = sumAmmonia / count;
        }

        // Species optimal range checks
        com.smartfisheries.entity.FishSpecies species = stock.getFishSpecies();
        double phMin = species.getOptimalPhMin() != null ? species.getOptimalPhMin() : 6.5;
        double phMax = species.getOptimalPhMax() != null ? species.getOptimalPhMax() : 8.5;
        double tempMin = species.getOptimalTempMin() != null ? species.getOptimalTempMin() : 25.0;
        double tempMax = species.getOptimalTempMax() != null ? species.getOptimalTempMax() : 30.0;
        double doMin = species.getOptimalDoMin() != null ? species.getOptimalDoMin() : 4.0;
        double ammoniaMax = species.getOptimalAmmoniaMax() != null ? species.getOptimalAmmoniaMax() : 0.05;

        // Check if environment is suboptimal
        boolean badPh = avgPh < phMin || avgPh > phMax;
        boolean badTemp = avgTemp < tempMin || avgTemp > tempMax;
        boolean badDo = avgDo < doMin;
        boolean badAmmonia = avgAmmonia > ammoniaMax;

        double predictedFcr;
        double confidenceLevel;
        double recommendedFeedQuantityKg;
        double harvestReadyProbability;
        String analysisStatus;
        String recommendationNotes;

        // Base feed rate calculation: standard is 2.5% of total biomass per day
        double currentBiomassKg = stock.getCurrentQuantity() * (stock.getCurrentWeightG() * 0.001);
        double baseRecommendedFeedRate = currentBiomassKg * 0.025; 

        // Target weight check
        double targetHarvestWeightG = 300.0;
        if (species.getName().toLowerCase().contains("lele")) {
            targetHarvestWeightG = 150.0;
        } else if (species.getName().toLowerCase().contains("mas")) {
            targetHarvestWeightG = 400.0;
        }
        
        harvestReadyProbability = Math.min(0.99, (stock.getCurrentWeightG() / targetHarvestWeightG));
        harvestReadyProbability = Math.round(harvestReadyProbability * 100.0) / 100.0;

        if (badDo || badAmmonia) {
            predictedFcr = currentFcr + 0.22;
            confidenceLevel = 0.85;
            recommendedFeedQuantityKg = baseRecommendedFeedRate * 0.5; // Restrict feed by 50%
            analysisStatus = "CRITICAL WARNING: SUBOPTIMAL ECOSYSTEM";
            recommendationNotes = "Kualitas air berada di zona kritis (DO rendah / amonia tinggi). Nafsu makan ikan menurun drastis dan metabolisme terganggu. Kurangi pemberian pakan sebesar 50% untuk mencegah pembusukan pakan di dasar kolam dan kurangi bioload. Segera nyalakan aerasi penuh!";
        } else if (badPh || badTemp) {
            predictedFcr = currentFcr + 0.11;
            confidenceLevel = 0.88;
            recommendedFeedQuantityKg = baseRecommendedFeedRate * 0.8; // Restrict by 20%
            analysisStatus = "WARNING: UNSTABLE ENVIRONMENT";
            recommendationNotes = "Parameter pH atau suhu tidak stabil di luar batas optimal. Ikan mengalami stres lingkungan sedang. Batasi pakan sebesar 20% dari takaran harian normal. Lakukan pergantian air bertahap atau pemberian kapur jika pH terlalu asam.";
        } else {
            predictedFcr = Math.max(1.05, currentFcr - 0.03);
            confidenceLevel = 0.94;
            recommendedFeedQuantityKg = baseRecommendedFeedRate;
            analysisStatus = "EXCELLENT: OPTIMAL ECOSYSTEM";
            recommendationNotes = "Selamat! Seluruh parameter air (pH, Suhu, DO, Amonia) berada di kisaran optimal. Konversi pakan berjalan efisien secara biologi. Berikan takaran pakan penuh sesuai jadwal harian. Tingkat pertumbuhan biomassa diperkirakan maksimal.";
        }

        predictedFcr = Math.round(predictedFcr * 100.0) / 100.0;
        recommendedFeedQuantityKg = Math.round(recommendedFeedQuantityKg * 10.0) / 10.0;

        return new FcrDto.AiForecastResponse(
                predictedFcr,
                confidenceLevel,
                recommendedFeedQuantityKg,
                harvestReadyProbability,
                analysisStatus,
                recommendationNotes
        );
    }
}
