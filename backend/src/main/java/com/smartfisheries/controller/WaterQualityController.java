package com.smartfisheries.controller;

import com.smartfisheries.dto.WaterQualityDto;
import com.smartfisheries.security.CustomUserDetails;
import com.smartfisheries.service.WaterQualityService;
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
@Tag(name = "Water Quality", description = "Endpoints for logging physical-chemical parameters and fetching history")
public class WaterQualityController {

    private final WaterQualityService waterQualityService;

    @PostMapping("/ponds/{pondId}/water-quality")
    @Operation(summary = "Log manual or IoT water quality metrics", description = "Inputs pH, DO, Temperature, Salinity, and Ammonia. Trigger automated warnings if thresholds are breached.")
    public ResponseEntity<WaterQualityDto.WaterQualityResponse> recordWater(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId,
            @Valid @RequestBody WaterQualityDto.WaterQualityRequest request
    ) {
        return ResponseEntity.ok(waterQualityService.recordWaterQuality(userDetails.getUser().getId(), pondId, request));
    }

    @PostMapping("/ponds/{pondId}/water-quality/iot-simulate")
    @Operation(summary = "Simulate an IoT device sending sensor data for a pond", description = "Generates mock pH, DO, Temperature, Salinity, and Ammonia parameters. Mode can be 'NORMAL' or 'ALERT'.")
    public ResponseEntity<WaterQualityDto.WaterQualityResponse> simulateIot(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId,
            @RequestParam(defaultValue = "NORMAL") String mode
    ) {
        return ResponseEntity.ok(waterQualityService.simulateIotData(userDetails.getUser().getId(), pondId, mode));
    }


    @GetMapping("/ponds/{pondId}/water-quality/latest")
    @Operation(summary = "Get latest recorded condition for a pond dashboard")
    public ResponseEntity<WaterQualityDto.WaterQualityResponse> getLatest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId
    ) {
        return ResponseEntity.ok(waterQualityService.getLatestCondition(userDetails.getUser().getId(), pondId));
    }

    @GetMapping("/ponds/{pondId}/water-quality/history")
    @Operation(summary = "Get historical readings for rendering charts", description = "Returns chronological items for the last N days (default 7 days).")
    public ResponseEntity<List<WaterQualityDto.WaterQualityResponse>> getHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId,
            @RequestParam(defaultValue = "7") int days
    ) {
        return ResponseEntity.ok(waterQualityService.getHistoricalRecords(userDetails.getUser().getId(), pondId, days));
    }

    @DeleteMapping("/water-quality/{recordId}")
    @Operation(summary = "Delete a logged water quality record entry")
    public ResponseEntity<String> deleteRecord(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long recordId
    ) {
        waterQualityService.deleteRecord(userDetails.getUser().getId(), recordId);
        return ResponseEntity.ok("Water quality record deleted");
    }
}
