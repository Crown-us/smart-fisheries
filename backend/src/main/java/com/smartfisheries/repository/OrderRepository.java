package com.smartfisheries.repository;

import com.smartfisheries.entity.Order;
import com.smartfisheries.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByConsumerId(Long consumerId);
    List<Order> findByStatus(OrderStatus status);
}
