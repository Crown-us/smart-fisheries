package com.smartfisheries.repository;

import com.smartfisheries.entity.PondStock;
import com.smartfisheries.entity.PondStockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PondStockRepository extends JpaRepository<PondStock, Long> {
    List<PondStock> findByPondId(Long pondId);
    List<PondStock> findByPondIdAndStatus(Long pondId, PondStockStatus status);
    Optional<PondStock> findFirstByPondIdAndStatusOrderByStockedAtDesc(Long pondId, PondStockStatus status);
}
