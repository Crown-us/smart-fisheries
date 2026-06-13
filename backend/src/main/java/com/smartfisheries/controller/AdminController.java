package com.smartfisheries.controller;

import com.smartfisheries.dto.MarketplaceDto;
import com.smartfisheries.entity.ProductModerationStatus;
import com.smartfisheries.entity.User;
import com.smartfisheries.exception.ResourceNotFoundException;
import com.smartfisheries.repository.UserRepository;
import com.smartfisheries.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Administrative controls for user verification, marketplace listing moderation, and analytics")
public class AdminController {

    private final UserRepository userRepository;
    private final MarketplaceService marketplaceService;

    @GetMapping("/users")
    @Operation(summary = "Get a list of all platform users")
    public ResponseEntity<List<User>> listUsers() {
        // Return users directly; in production, map to UserDto to avoid password leak
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{userId}/verify")
    @Operation(summary = "Verify a farmer manually without certification documents")
    public ResponseEntity<String> verifyFarmer(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        return ResponseEntity.ok("Farmer verified successfully");
    }

    @PutMapping("/products/{productId}/moderate")
    @Operation(summary = "Moderate a product listing (Approve / Reject)")
    public ResponseEntity<MarketplaceDto.ProductResponse> moderateProduct(
            @PathVariable Long productId,
            @RequestParam ProductModerationStatus status
    ) {
        // We pass the admin's context (e.g. system id or stub for logging)
        return ResponseEntity.ok(marketplaceService.moderateProduct(1L, productId, status));
    }
}
