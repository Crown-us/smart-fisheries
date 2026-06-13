package com.smartfisheries.controller;

import com.smartfisheries.dto.MarketplaceDto;
import com.smartfisheries.entity.OrderStatus;
import com.smartfisheries.security.CustomUserDetails;
import com.smartfisheries.service.MarketplaceService;
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
@Tag(name = "Marketplace", description = "Endpoints for browsing products, submitting orders, and managing farmer inventory catalog")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    // --- Public Marketplace Browsing (PermitAll in SecurityConfig) ---

    @GetMapping("/api/auth/marketplace/products")
    @Operation(summary = "Browse, search, and filter approved products", description = "Public endpoint. Search by query string (name/description) and filter by category.")
    public ResponseEntity<List<MarketplaceDto.ProductResponse>> browseProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(marketplaceService.searchMarketplace(query, category));
    }

    @GetMapping("/api/auth/marketplace/products/{productId}")
    @Operation(summary = "Get single product specifications and gallery details")
    public ResponseEntity<MarketplaceDto.ProductResponse> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(marketplaceService.getProduct(productId));
    }

    // --- Farmer Inventory Management ---

    @PostMapping("/api/farmer/products")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "List a new product for sale in the marketplace")
    public ResponseEntity<MarketplaceDto.ProductResponse> createProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody MarketplaceDto.ProductRequest request
    ) {
        return ResponseEntity.ok(marketplaceService.createProduct(userDetails.getUser().getId(), request));
    }

    @PutMapping("/api/farmer/products/{productId}")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Update product details", description = "Updates reset moderation status back to pending approval.")
    public ResponseEntity<MarketplaceDto.ProductResponse> updateProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long productId,
            @Valid @RequestBody MarketplaceDto.ProductRequest request
    ) {
        return ResponseEntity.ok(marketplaceService.updateProduct(userDetails.getUser().getId(), productId, request));
    }

    @DeleteMapping("/api/farmer/products/{productId}")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Remove a product listing from the marketplace catalog")
    public ResponseEntity<String> deleteProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long productId
    ) {
        marketplaceService.deleteProduct(userDetails.getUser().getId(), productId);
        return ResponseEntity.ok("Product deleted successfully");
    }

    @GetMapping("/api/farmer/products")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Get list of all listings owned by logged-in farmer")
    public ResponseEntity<List<MarketplaceDto.ProductResponse>> listFarmerCatalog(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(marketplaceService.listFarmerProducts(userDetails.getUser().getId()));
    }

    // --- Consumer Checkout & Order History ---

    @PostMapping("/api/consumer/orders")
    @PreAuthorize("hasRole('CONSUMER')")
    @Operation(summary = "Checkout a shopping cart items to create order", description = "Verifies product stock availability, decrements inventory, and registers new transaction.")
    public ResponseEntity<MarketplaceDto.OrderResponse> checkout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody MarketplaceDto.OrderRequest request
    ) {
        return ResponseEntity.ok(marketplaceService.checkoutOrder(userDetails.getUser().getId(), request));
    }

    @GetMapping("/api/consumer/orders")
    @PreAuthorize("hasRole('CONSUMER')")
    @Operation(summary = "Get purchase history for logged-in consumer")
    public ResponseEntity<List<MarketplaceDto.OrderResponse>> listConsumerOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(marketplaceService.getConsumerOrders(userDetails.getUser().getId()));
    }

    // --- Shared Transaction Detail Updates ---

    @GetMapping("/api/orders/{orderId}")
    @Operation(summary = "View order details", description = "Authorized for the buyer (consumer), vendor (farmer), or system administrators.")
    public ResponseEntity<MarketplaceDto.OrderResponse> viewOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(marketplaceService.getOrderDetails(userDetails.getUser().getId(), orderId));
    }

    @PutMapping("/api/farmer/orders/{orderId}/status")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    @Operation(summary = "Update order status", description = "Moves order from pending, paid, shipped, to completed.")
    public ResponseEntity<MarketplaceDto.OrderResponse> updateStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(marketplaceService.updateOrderStatus(orderId, status));
    }
}
