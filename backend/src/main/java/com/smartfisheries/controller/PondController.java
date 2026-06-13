package com.smartfisheries.controller;

import com.smartfisheries.dto.FarmDto;
import com.smartfisheries.security.CustomUserDetails;
import com.smartfisheries.service.FarmService;
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
@Tag(name = "Farm Management", description = "Endpoints for farmers to manage ponds, stock fish species, and update weight telemetry")
public class PondController {

    private final FarmService farmService;

    @PostMapping("/ponds")
    @Operation(summary = "Create a new pond")
    public ResponseEntity<FarmDto.PondResponse> createPond(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody FarmDto.PondRequest request
    ) {
        return ResponseEntity.ok(farmService.createPond(userDetails.getUser().getId(), request));
    }

    @GetMapping("/ponds")
    @Operation(summary = "List all ponds owned by the logged-in farmer")
    public ResponseEntity<List<FarmDto.PondResponse>> listPonds(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(farmService.listFarmerPonds(userDetails.getUser().getId()));
    }

    @GetMapping("/ponds/{pondId}")
    @Operation(summary = "Get detailed configuration of a specific pond")
    public ResponseEntity<FarmDto.PondResponse> getPond(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId
    ) {
        return ResponseEntity.ok(farmService.getPond(userDetails.getUser().getId(), pondId));
    }

    @PutMapping("/ponds/{pondId}")
    @Operation(summary = "Update pond configurations")
    public ResponseEntity<FarmDto.PondResponse> updatePond(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId,
            @Valid @RequestBody FarmDto.PondRequest request
    ) {
        return ResponseEntity.ok(farmService.updatePond(userDetails.getUser().getId(), pondId, request));
    }

    @DeleteMapping("/ponds/{pondId}")
    @Operation(summary = "Delete a pond listing")
    public ResponseEntity<String> deletePond(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId
    ) {
        farmService.deletePond(userDetails.getUser().getId(), pondId);
        return ResponseEntity.ok("Pond deleted successfully");
    }

    @PostMapping("/ponds/{pondId}/stock")
    @Operation(summary = "Stock a pond with a new fish cultivation batch")
    public ResponseEntity<FarmDto.PondStockResponse> stockPond(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId,
            @Valid @RequestBody FarmDto.PondStockRequest request
    ) {
        return ResponseEntity.ok(farmService.stockPond(userDetails.getUser().getId(), pondId, request));
    }

    @PutMapping("/ponds/{pondId}/stock/{stockId}/harvest")
    @Operation(summary = "Mark a stocked fish cultivation batch as harvested")
    public ResponseEntity<FarmDto.PondStockResponse> harvestStock(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long pondId,
            @PathVariable Long stockId
    ) {
        return ResponseEntity.ok(farmService.harvestStock(userDetails.getUser().getId(), pondId, stockId));
    }

    @PutMapping("/stock/{stockId}/weight")
    @Operation(summary = "Log fish growth by updating current average weight and count")
    public ResponseEntity<FarmDto.PondStockResponse> updateWeight(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long stockId,
            @RequestParam(required = false) Double weightG,
            @RequestParam(required = false) Integer quantity
    ) {
        return ResponseEntity.ok(farmService.updateCurrentWeight(userDetails.getUser().getId(), stockId, weightG, quantity));
    }

    @GetMapping("/fish-species")
    @Operation(summary = "List all registerable fish species configurations")
    public ResponseEntity<List<FarmDto.FishSpeciesResponse>> listFishSpecies() {
        return ResponseEntity.ok(farmService.listFishSpecies());
    }
}
