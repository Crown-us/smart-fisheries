package com.smartfisheries.dto;

import com.smartfisheries.entity.CertStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public final class CertificationDto {

    private CertificationDto() {}

    public record CertificationRequest(
            @NotBlank(message = "Title is required")
            String title,

            String description,

            @NotBlank(message = "Document URL is required")
            String documentUrl
    ) {}

    public record CertificationResponse(
            Long id,
            Long farmerId,
            String farmerName,
            String title,
            String description,
            String documentUrl,
            CertStatus status,
            Long reviewerId,
            String reviewerName,
            String reviewNotes,
            LocalDateTime reviewedAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record ReviewCertificationRequest(
            @NotNull(message = "Review status is required")
            CertStatus status,

            String reviewNotes
    ) {}
}
