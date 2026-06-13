package com.smartfisheries.repository;

import com.smartfisheries.entity.FeedingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedingRecordRepository extends JpaRepository<FeedingRecord, Long> {
    List<FeedingRecord> findByPondStockIdOrderByFedAtDesc(Long pondStockId);

    @Query("SELECT SUM(f.quantityKg) FROM FeedingRecord f WHERE f.pondStock.id = :stockId")
    Double sumQuantityByPondStockId(@Param("stockId") Long stockId);
}
