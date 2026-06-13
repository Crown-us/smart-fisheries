package com.smartfisheries.controller;

import com.smartfisheries.dto.CertificationDto;
import com.smartfisheries.security.CustomUserDetails;
import com.smartfisheries.service.CertificationService;
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
@RequiredArgsConstructor
@Tag(name = "Digital Certification", description = "Endpoints for digital credentials request submission (Farmers) and review checks (Admins)")
public class CertificationController {

    private final CertificationService certificationService;

    @PostMapping("/api/farmer/certifications")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Submit a certification request", description = "Allows farmers to submit verification documents (GAP, Indogap, CBIB, etc.) for admin review.")
    public ResponseEntity<CertificationDto.CertificationResponse> submitCert(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CertificationDto.CertificationRequest request
    ) {
        return ResponseEntity.ok(certificationService.submitCertification(userDetails.getUser().getId(), request));
    }

    @GetMapping("/api/farmer/certifications")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Get request submission history for logged-in farmer")
    public ResponseEntity<List<CertificationDto.CertificationResponse>> listFarmerCerts(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(certificationService.getFarmerCertifications(userDetails.getUser().getId()));
    }

    @GetMapping("/api/admin/certifications/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all unreviewed/pending certification applications")
    public ResponseEntity<List<CertificationDto.CertificationResponse>> listPending() {
        return ResponseEntity.ok(certificationService.getPendingCertifications());
    }

    @PutMapping("/api/admin/certifications/{certId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve or reject a certification request", description = "Admin reviews documents. Approval triggers verified status update for the farmer.")
    public ResponseEntity<CertificationDto.CertificationResponse> reviewCert(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long certId,
            @Valid @RequestBody CertificationDto.ReviewCertificationRequest request
    ) {
        return ResponseEntity.ok(certificationService.reviewCertification(userDetails.getUser().getId(), certId, request));
    }
}
