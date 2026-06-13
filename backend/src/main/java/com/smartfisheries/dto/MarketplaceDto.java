package com.smartfisheries.dto;

import com.smartfisheries.entity.OrderStatus;
import com.smartfisheries.entity.ProductCategory;
import com.smartfisheries.entity.ProductModerationStatus;
import com.smartfisheries.entity.ProductUnit;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class MarketplaceDto {

    private MarketplaceDto() {}

    public record ProductRequest(
            @NotBlank(message = "Product name is required")
            @Size(max = 150)
            String name,

            String description,

            @NotNull(message = "Price is required")
            @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
            BigDecimal price,

            @NotNull(message = "Stock quantity is required")
            @Min(value = 0, message = "Stock must be positive")
            Double stockQuantity,

            @NotNull(message = "Unit is required")
            ProductUnit unit,

            @NotNull(message = "Category is required")
            ProductCategory category,

            List<String> imageUrls
    ) {}

    public record ProductImageResponse(
            Long id,
            String imageUrl,
            boolean primary
    ) {}

    public record ProductResponse(
            Long id,
            Long farmerId,
            String farmerName,
            String name,
            String description,
            BigDecimal price,
            Double stockQuantity,
            ProductUnit unit,
            ProductCategory category,
            boolean moderated,
            ProductModerationStatus moderationStatus,
            List<ProductImageResponse> images,
            LocalDateTime createdAt
    ) {}

    public record OrderItemRequest(
            @NotNull(message = "Product ID is required")
            Long productId,

            @NotNull(message = "Quantity is required")
            @Min(value = 0, message = "Quantity must be positive")
            Double quantity
    ) {}

    public record OrderRequest(
            @NotBlank(message = "Shipping address is required")
            String shippingAddress,

            @NotEmpty(message = "Order must contain at least one product")
            List<OrderItemRequest> items
    ) {}

    public record OrderItemResponse(
            Long id,
            Long productId,
            String productName,
            Double quantity,
            BigDecimal pricePerUnit
    ) {}

    public record OrderResponse(
            Long id,
            Long consumerId,
            String consumerName,
            BigDecimal totalAmount,
            OrderStatus status,
            String shippingAddress,
            List<OrderItemResponse> items,
            LocalDateTime createdAt
    ) {}
}
