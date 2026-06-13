package com.smartfisheries.repository;

import com.smartfisheries.entity.FcrRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FcrRecordRepository extends JpaRepository<FcrRecord, Long> {
    List<FcrRecord> findByPondStockIdOrderByCalculationDateDesc(Long pondStockId);
}
