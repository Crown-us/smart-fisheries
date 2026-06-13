package com.smartfisheries.service;

import com.smartfisheries.dto.MarketplaceDto;
import com.smartfisheries.entity.*;
import com.smartfisheries.exception.BadRequestException;
import com.smartfisheries.exception.ResourceNotFoundException;
import com.smartfisheries.mapper.OrderMapper;
import com.smartfisheries.mapper.ProductMapper;
import com.smartfisheries.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final NotificationService notificationService;
    private final ProductMapper productMapper;
    private final OrderMapper orderMapper;

    @Transactional
    public MarketplaceDto.ProductResponse createProduct(Long farmerId, MarketplaceDto.ProductRequest request) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));

        Product product = Product.builder()
                .farmer(farmer)
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .stockQuantity(BigDecimal.valueOf(request.stockQuantity()))
                .unit(request.unit())
                .category(request.category())
                .moderationStatus(ProductModerationStatus.PENDING)
                .moderated(false)
                .build();

        Product saved = productRepository.save(product);

        // Save gallery images if provided
        if (request.imageUrls() != null && !request.imageUrls().isEmpty()) {
            boolean isFirst = true;
            for (String url : request.imageUrls()) {
                ProductImage image = ProductImage.builder()
                        .product(saved)
                        .imageUrl(url)
                        .primary(isFirst)
                        .build();
                productImageRepository.save(image);
                saved.getImages().add(image);
                isFirst = false;
            }
        }

        return productMapper.toProductResponse(saved);
    }

    @Transactional
    public MarketplaceDto.ProductResponse updateProduct(Long farmerId, Long productId, MarketplaceDto.ProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this product listing");
        }

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(BigDecimal.valueOf(request.stockQuantity()));
        product.setUnit(request.unit());
        product.setCategory(request.category());
        
        // Retain moderation queue if details are altered
        product.setModerationStatus(ProductModerationStatus.PENDING);
        product.setModerated(false);

        Product updated = productRepository.save(product);
        return productMapper.toProductResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long farmerId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this product listing");
        }

        productRepository.delete(product);
    }

    public MarketplaceDto.ProductResponse getProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toProductResponse(product);
    }

    public List<MarketplaceDto.ProductResponse> listFarmerProducts(Long farmerId) {
        return productRepository.findByFarmerId(farmerId).stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    public List<MarketplaceDto.ProductResponse> searchMarketplace(String query, String category) {
        List<Product> products;
        
        if (query != null && !query.trim().isEmpty()) {
            products = productRepository.searchProducts(query);
        } else {
            products = productRepository.findByModerationStatus(ProductModerationStatus.APPROVED);
        }

        if (category != null && !category.trim().isEmpty()) {
            try {
                ProductCategory cat = ProductCategory.valueOf(category.toUpperCase());
                products = products.stream()
                        .filter(p -> p.getCategory() == cat)
                        .toList();
            } catch (IllegalArgumentException e) {
                // Ignore invalid category filters
            }
        }

        return products.stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    @Transactional
    public MarketplaceDto.ProductResponse moderateProduct(Long adminId, Long productId, ProductModerationStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setModerationStatus(status);
        product.setModerated(true);
        Product updated = productRepository.save(product);

        // Notify farmer
        notificationService.createNotification(
                product.getFarmer(),
                "Product Listing Moderated",
                String.format("Your product '%s' has been %s by administration.", product.getName(), status.name().toLowerCase()),
                status == ProductModerationStatus.APPROVED ? NotificationType.INFO : NotificationType.ALERT
        );

        return productMapper.toProductResponse(updated);
    }

    @Transactional
    public MarketplaceDto.OrderResponse checkoutOrder(Long consumerId, MarketplaceDto.OrderRequest request) {
        User consumer = userRepository.findById(consumerId)
                .orElseThrow(() -> new ResourceNotFoundException("Consumer not found"));

        Order order = Order.builder()
                .consumer(consumer)
                .shippingAddress(request.shippingAddress())
                .totalAmount(BigDecimal.ZERO)
                .status(OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (MarketplaceDto.OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemReq.productId()));

            if (product.getModerationStatus() != ProductModerationStatus.APPROVED) {
                throw new BadRequestException("Product " + product.getName() + " is currently unavailable for purchase");
            }

            if (product.getStockQuantity().doubleValue() < itemReq.quantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName() + ". Available: " + product.getStockQuantity());
            }

            // Deduct stock quantity
            product.setStockQuantity(product.getStockQuantity().subtract(BigDecimal.valueOf(itemReq.quantity())));
            productRepository.save(product);

            // Compute item price
            BigDecimal quantityBD = BigDecimal.valueOf(itemReq.quantity());
            BigDecimal itemCost = product.getPrice().multiply(quantityBD);
            totalAmount = totalAmount.add(itemCost);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(BigDecimal.valueOf(itemReq.quantity()))
                    .pricePerUnit(product.getPrice())
                    .build();

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Notify consumer
        notificationService.createNotification(
                consumer,
                "Order Created successfully",
                String.format("Thank you for purchasing! Your order #%d has been submitted with total amount Rp %,.2f", savedOrder.getId(), totalAmount),
                NotificationType.INFO
        );

        // Notify farmer (vendor) - in production, we filter items per vendor and send notifications
        if (!orderItems.isEmpty()) {
            User vendor = orderItems.get(0).getProduct().getFarmer();
            notificationService.createNotification(
                    vendor,
                    "New Sale Order Received",
                    String.format("You have received a new order #%d from %s.", savedOrder.getId(), consumer.getUsername()),
                    NotificationType.INFO
            );
        }

        return orderMapper.toOrderResponse(savedOrder);
    }

    public List<MarketplaceDto.OrderResponse> getConsumerOrders(Long consumerId) {
        return orderRepository.findByConsumerId(consumerId).stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    public MarketplaceDto.OrderResponse getOrderDetails(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Allow consumer, product farmer, or system admin to view details
        boolean isConsumer = order.getConsumer().getId().equals(userId);
        boolean isAdmin = userRepository.findById(userId).map(u -> u.getRole() == UserRole.ADMIN).orElse(false);
        boolean isFarmer = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getFarmer().getId().equals(userId));

        if (!isConsumer && !isAdmin && !isFarmer) {
            throw new BadRequestException("You do not have access to view this order");
        }

        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public MarketplaceDto.OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(status);
        Order updated = orderRepository.save(order);

        // Notify consumer
        notificationService.createNotification(
                order.getConsumer(),
                "Order Status Updated",
                String.format("Your order #%d is now %s.", order.getId(), status.name()),
                NotificationType.INFO
        );

        return orderMapper.toOrderResponse(updated);
    }
}
