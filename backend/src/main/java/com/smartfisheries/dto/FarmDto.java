package com.smartfisheries.dto;

import com.smartfisheries.entity.PondStatus;
import com.smartfisheries.entity.PondStockStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class FarmDto {

    private FarmDto() {}

    public record PondRequest(
            @NotBlank(message = "Pond name is required")
            @Size(max = 100)
            String name,

            @Size(max = 255)
            String location,

            @NotNull(message = "Length is required")
            @Min(value = 0, message = "Length must be positive")
            Double length,

            @NotNull(message = "Width is required")
            @Min(value = 0, message = "Width must be positive")
            Double width,

            @NotNull(message = "Depth is required")
            @Min(value = 0, message = "Depth must be positive")
            Double depth,

            @Size(max = 100)
            String waterSource,

            PondStatus status
    ) {}

    public record PondResponse(
            Long id,
            Long farmerId,
            String farmerName,
            String name,
            String location,
            Double length,
            Double width,
            Double depth,
            String waterSource,
            PondStatus status,
            LocalDateTime createdAt
    ) {}

    public record PondStockRequest(
            @NotNull(message = "Fish species ID is required")
            Long fishSpeciesId,

            @NotNull(message = "Initial quantity is required")
            @Min(value = 1, message = "Initial quantity must be at least 1")
            Integer initialQuantity,

            @NotNull(message = "Initial weight is required")
            @Min(value = 0, message = "Initial weight must be positive")
            Double initialWeightG,

            @NotNull(message = "Stocked date is required")
            LocalDateTime stockedAt
    ) {}

    public record PondStockResponse(
            Long id,
            Long pondId,
            String pondName,
            Long fishSpeciesId,
            String fishSpeciesName,
            Integer initialQuantity,
            Integer currentQuantity,
            Double initialWeightG,
            Double currentWeightG,
            LocalDateTime stockedAt,
            LocalDateTime harvestedAt,
            PondStockStatus status,
            LocalDateTime createdAt
    ) {}

    public record FishSpeciesResponse(
            Long id,
            String name,
            String scientificName,
            Double optimalPhMin,
            Double optimalPhMax,
            Double optimalTempMin,
            Double optimalTempMax,
            Double optimalDoMin,
            Double optimalDoMax,
            Double optimalSalinityMin,
            Double optimalSalinityMax,
            Double optimalAmmoniaMax
    ) {}
}
