package com.smartfisheries.controller;

import com.smartfisheries.dto.FcrDto;
import com.smartfisheries.security.CustomUserDetails;
import com.smartfisheries.service.FcrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/stock/{stockId}/fcr")
@PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
@RequiredArgsConstructor
@Tag(name = "FCR Analytics", description = "Endpoints for calculating Food Conversion Ratio (FCR) coefficients and history data")
public class FcrController {

    private final FcrService fcrService;

    @GetMapping("/report")
    @Operation(summary = "Calculate and retrieve current FCR dashboard metrics", description = "Forces recalculation of feed sums and biomass gain to return active FCR status.")
    public ResponseEntity<FcrDto.FcrReportResponse> getReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long stockId
    ) {
        return ResponseEntity.ok(fcrService.getFcrReport(userDetails.getUser().getId(), stockId));
    }

    @GetMapping("/history")
    @Operation(summary = "Get historical FCR checkpoints for chart line rendering")
    public ResponseEntity<List<FcrDto.FcrRecordResponse>> getHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long stockId
    ) {
        return ResponseEntity.ok(fcrService.getFcrHistory(userDetails.getUser().getId(), stockId));
    }

    @GetMapping("/ai-forecast")
    @Operation(summary = "Get AI FCR forecast and feeding recommendations based on pond ecosystems", description = "Calls the mock prediction service to estimate FCR, daily feed rates, and harvest probability.")
    public ResponseEntity<FcrDto.AiForecastResponse> getAiForecast(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long stockId
    ) {
        return ResponseEntity.ok(fcrService.getAiForecast(userDetails.getUser().getId(), stockId));
    }
}
