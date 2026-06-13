package com.smartfisheries.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public final class WaterQualityDto {

    private WaterQualityDto() {}

    public record WaterQualityRequest(
            @NotNull(message = "pH is required")
            Double ph,

            @NotNull(message = "Temperature is required")
            Double temperature,

            @NotNull(message = "Dissolved Oxygen is required")
            Double dissolvedOxygen,

            @NotNull(message = "Salinity is required")
            Double salinity,

            @NotNull(message = "Ammonia is required")
            Double ammonia,

            String notes,

            @NotNull(message = "Recorded time is required")
            LocalDateTime recordedAt
    ) {}

    public record WaterQualityResponse(
            Long id,
            Long pondId,
            String pondName,
            Double ph,
            Double temperature,
            Double dissolvedOxygen,
            Double salinity,
            Double ammonia,
            String notes,
            Long recordedById,
            String recordedByName,
            LocalDateTime recordedAt,
            LocalDateTime createdAt
    ) {}
}
