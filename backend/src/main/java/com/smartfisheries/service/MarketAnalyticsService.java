package com.smartfisheries.service;

import com.smartfisheries.entity.OrderStatus;
import com.smartfisheries.entity.ProductCategory;
import com.smartfisheries.entity.UserRole;
import com.smartfisheries.repository.OrderRepository;
import com.smartfisheries.repository.ProductRepository;
import com.smartfisheries.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MarketAnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getMarketDashboard() {
        Map<String, Object> analytics = new HashMap<>();

        // 1. Basic Counts
        long totalProducts = productRepository.count();
        long totalFarmers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.FARMER).count();
        long totalConsumers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.CONSUMER).count();

        analytics.put("totalProducts", totalProducts);
        analytics.put("totalFarmers", totalFarmers);
        analytics.put("totalConsumers", totalConsumers);

        // 2. Revenue Summary
        List<com.smartfisheries.entity.Order> completedOrders = orderRepository.findByStatus(OrderStatus.COMPLETED);
        List<com.smartfisheries.entity.Order> paidOrders = orderRepository.findByStatus(OrderStatus.PAID);
        List<com.smartfisheries.entity.Order> shippedOrders = orderRepository.findByStatus(OrderStatus.SHIPPED);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        for (com.smartfisheries.entity.Order order : completedOrders) {
            totalRevenue = totalRevenue.add(order.getTotalAmount());
        }
        for (com.smartfisheries.entity.Order order : paidOrders) {
            totalRevenue = totalRevenue.add(order.getTotalAmount());
        }
        for (com.smartfisheries.entity.Order order : shippedOrders) {
            totalRevenue = totalRevenue.add(order.getTotalAmount());
        }

        analytics.put("totalRevenue", totalRevenue);
        analytics.put("totalTransactionsCount", completedOrders.size() + paidOrders.size() + shippedOrders.size());

        // 3. Sales By Category (Popularity Trend)
        Map<String, Double> categorySales = new HashMap<>();
        for (ProductCategory cat : ProductCategory.values()) {
            categorySales.put(cat.name(), 0.0);
        }

        List<com.smartfisheries.entity.Order> allSuccessfulOrders = new ArrayList<>();
        allSuccessfulOrders.addAll(completedOrders);
        allSuccessfulOrders.addAll(paidOrders);
        allSuccessfulOrders.addAll(shippedOrders);

        for (com.smartfisheries.entity.Order order : allSuccessfulOrders) {
            for (com.smartfisheries.entity.OrderItem item : order.getItems()) {
                String category = item.getProduct().getCategory().name();
                double currentQty = categorySales.getOrDefault(category, 0.0);
                categorySales.put(category, currentQty + item.getQuantity().doubleValue());
            }
        }
        analytics.put("categorySales", categorySales);

        // 4. Monthly/Weekly Trends Mock data for chart rendering (to guarantee data even if DB is fresh)
        List<Map<String, Object>> revenueTrend = List.of(
                Map.of("month", "Jan", "sales", 12000000, "revenue", 8500000),
                Map.of("month", "Feb", "sales", 15000000, "revenue", 11000000),
                Map.of("month", "Mar", "sales", 18000000, "revenue", 13500000),
                Map.of("month", "Apr", "sales", 22000000, "revenue", 16000000),
                Map.of("month", "May", "sales", 30000000, "revenue", 21000000),
                Map.of("month", "Jun", "sales", totalRevenue.doubleValue() > 0 ? totalRevenue : 35000000, "revenue", totalRevenue.doubleValue() * 0.7 > 0 ? totalRevenue.doubleValue() * 0.7 : 24500000)
        );
        analytics.put("revenueTrend", revenueTrend);

        return analytics;
    }

    public Map<String, Object> getAdminStatistics() {
        Map<String, Object> stats = getMarketDashboard();
        
        // Add user validation verification statistics
        long totalUsers = userRepository.count();
        long unverifiedFarmers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.FARMER && !u.isVerified()).count();

        stats.put("totalUsersCount", totalUsers);
        stats.put("unverifiedFarmersCount", unverifiedFarmers);
        
        return stats;
    }
}
