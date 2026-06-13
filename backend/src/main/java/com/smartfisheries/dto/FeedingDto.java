package com.smartfisheries.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.LocalTime;

public final class FeedingDto {

    private FeedingDto() {}

    public record FeedingRecordRequest(
            @NotNull(message = "Feed type ID is required")
            Long feedTypeId,

            @NotNull(message = "Quantity (kg) is required")
            @Min(value = 0, message = "Quantity must be positive")
            Double quantityKg,

            @NotNull(message = "Feeding time is required")
            LocalDateTime fedAt
    ) {}

    public record FeedingRecordResponse(
            Long id,
            Long pondStockId,
            Long feedTypeId,
            String feedTypeName,
            Double quantityKg,
            LocalDateTime fedAt,
            Long recordedById,
            String recordedByName,
            LocalDateTime createdAt
    ) {}

    public record FeedingScheduleRequest(
            @NotNull(message = "Feed type ID is required")
            Long feedTypeId,

            @NotNull(message = "Feeding time is required")
            LocalTime timeOfDay,

            @NotNull(message = "Quantity (kg) is required")
            @Min(value = 0, message = "Quantity must be positive")
            Double quantityKg,

            Boolean isActive
    ) {}

    public record FeedingScheduleResponse(
            Long id,
            Long pondId,
            Long feedTypeId,
            String feedTypeName,
            LocalTime timeOfDay,
            Double quantityKg,
            boolean isActive,
            LocalDateTime createdAt
    ) {}

    public record FeedTypeResponse(
            Long id,
            String name,
            String manufacturer,
            Double proteinPercentage,
            Double fatPercentage,
            String notes
    ) {}
}
