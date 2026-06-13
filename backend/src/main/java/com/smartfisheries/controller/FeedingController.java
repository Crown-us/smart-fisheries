package com.smartfisheries.controller;

import com.smartfisheries.dto.FeedingDto;
import com.smartfisheries.security.CustomUserDetails;
import com.smartfisheries.service.FeedingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer")
@PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Feeding Management", description = "Endpoints for logging feed applications and planning feeding schedules")
public class FeedingController {

    private final FeedingService feedingService;

    @PostMapping("/stock/{stockId}/feeding")
    @Operation(summary = "Log a new feeding session", description = "Logs quantity in kg. Triggers automatic FCR calculations.")
    public ResponseEntity<FeedingDto.FeedingRecordResponse> recordFeeding(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long stockId,
            @Valid @RequestBody FeedingDto.FeedingRecordRequest request
    ) {
        return ResponseEntity.ok(feedingService.recordFeeding(userDetails.getUser().getId(), stockId, request));
    }

    @GetMapping("/stock/{stockId}/feeding")
    @Operation(summary = "Get historical feeding logs for a stock batch")
    public ResponseEntity<List<FeedingDto.FeedingRecordResponse>> getFeedingHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long stockId
    ) {
        return ResponseEntity.ok(feedingService.getFeedingHistory(userDetails.getUser().getId(), stockId));
    }

    @PostMapping("/ponds/{pondId}/feeding-schedules")
    @Operation(summary = "Create a recurring feeding schedule")
    public ResponseEntity<FeedingDto.FeedingScheduleResponse> createSchedule(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId,
            @Valid @RequestBody FeedingDto.FeedingScheduleRequest request
    ) {
        return ResponseEntity.ok(feedingService.createSchedule(userDetails.getUser().getId(), pondId, request));
    }

    @GetMapping("/ponds/{pondId}/feeding-schedules")
    @Operation(summary = "Get all feeding schedules for a pond")
    public ResponseEntity<List<FeedingDto.FeedingScheduleResponse>> getSchedules(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId
    ) {
        return ResponseEntity.ok(feedingService.getSchedules(userDetails.getUser().getId(), pondId));
    }

    @PutMapping("/feeding-schedules/{scheduleId}")
    @Operation(summary = "Update feeding schedule settings")
    public ResponseEntity<FeedingDto.FeedingScheduleResponse> updateSchedule(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long scheduleId,
            @Valid @RequestBody FeedingDto.FeedingScheduleRequest request
    ) {
        return ResponseEntity.ok(feedingService.updateSchedule(userDetails.getUser().getId(), scheduleId, request));
    }

    @DeleteMapping("/feeding-schedules/{scheduleId}")
    @Operation(summary = "Delete a feeding schedule")
    public ResponseEntity<String> deleteSchedule(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long scheduleId
    ) {
        feedingService.deleteSchedule(userDetails.getUser().getId(), scheduleId);
        return ResponseEntity.ok("Feeding schedule deleted successfully");
    }

    @GetMapping("/feed-types")
    @Operation(summary = "List standard commercial feed types catalog")
    public ResponseEntity<List<FeedingDto.FeedTypeResponse>> listFeedTypes() {
        return ResponseEntity.ok(feedingService.listFeedTypes());
    }
}
