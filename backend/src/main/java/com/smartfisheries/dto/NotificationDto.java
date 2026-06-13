package com.smartfisheries.dto;

import com.smartfisheries.entity.NotificationType;
import java.time.LocalDateTime;

public final class NotificationDto {

    private NotificationDto() {}

    public record NotificationResponse(
            Long id,
            Long userId,
            String title,
            String message,
            NotificationType type,
            boolean read,
            LocalDateTime createdAt
    ) {}
}
