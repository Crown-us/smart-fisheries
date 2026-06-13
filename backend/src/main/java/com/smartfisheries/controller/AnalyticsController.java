package com.smartfisheries.controller;

import com.smartfisheries.service.MarketAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Market Analytics", description = "Endpoints for retrieving marketplace sales trends and admin system statistics")
public class AnalyticsController {

    private final MarketAnalyticsService analyticsService;

    @GetMapping("/api/auth/marketplace/analytics")
    @Operation(summary = "Get public marketplace sales and product trends", description = "Public dashboard data showing popular categories and transaction aggregates.")
    public ResponseEntity<Map<String, Object>> getPublicDashboard() {
        return ResponseEntity.ok(analyticsService.getMarketDashboard());
    }

    @GetMapping("/api/admin/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get administrative platform statistics dashboard", description = "Requires admin credentials. Returns platform user counts, unverified logs, and total revenues.")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        return ResponseEntity.ok(analyticsService.getAdminStatistics());
    }
}
