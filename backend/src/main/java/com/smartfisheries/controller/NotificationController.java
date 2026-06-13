package com.smartfisheries.controller;

import com.smartfisheries.dto.NotificationDto;
import com.smartfisheries.security.CustomUserDetails;
import com.smartfisheries.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Alert & Notification", description = "Endpoints for viewing in-app warnings, alarms, and markings feeds as read")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all notifications for logged-in user")
    public ResponseEntity<List<NotificationDto.NotificationResponse>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userDetails.getUser().getId()));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get all unread warnings/alerts for badge displays")
    public ResponseEntity<List<NotificationDto.NotificationResponse>> getUnread(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(userDetails.getUser().getId()));
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<String> markRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long notificationId
    ) {
        notificationService.markAsRead(userDetails.getUser().getId(), notificationId);
        return ResponseEntity.ok("Notification marked as read");
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications for logged-in user as read")
    public ResponseEntity<String> markAllRead(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        notificationService.markAllAsRead(userDetails.getUser().getId());
        return ResponseEntity.ok("All notifications marked as read");
    }
}
