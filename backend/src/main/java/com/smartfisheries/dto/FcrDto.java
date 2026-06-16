package com.smartfisheries.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class FcrDto {

    private FcrDto() {}

    public record FcrRecordResponse(
            Long id,
            Long pondStockId,
            LocalDate calculationDate,
            Double totalFeedGivenKg,
            Double totalBiomassGainKg,
            Double fcrValue,
            LocalDateTime createdAt
    ) {}

    public record FcrReportResponse(
            Long pondStockId,
            String fishSpeciesName,
            Integer initialQuantity,
            Integer currentQuantity,
            Double initialWeightKg,
            Double currentWeightKg,
            Double totalBiomassGainKg,
            Double totalFeedGivenKg,
            Double currentFcr,
            LocalDate calculationDate
    ) {}

    public record AiForecastResponse(
            Double predictedFcr,
            Double confidenceLevel,
            Double recommendedFeedQuantityKg,
            Double harvestReadyProbability,
            String analysisStatus,
            String recommendationNotes
    ) {}
}
