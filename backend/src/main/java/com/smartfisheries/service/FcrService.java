package com.smartfisheries.service;

import com.smartfisheries.dto.FcrDto;
import com.smartfisheries.entity.FcrRecord;
import com.smartfisheries.entity.PondStock;
import com.smartfisheries.exception.BadRequestException;
import com.smartfisheries.exception.ResourceNotFoundException;
import com.smartfisheries.repository.FcrRecordRepository;
import com.smartfisheries.repository.FeedingRecordRepository;
import com.smartfisheries.repository.PondStockRepository;
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
}
