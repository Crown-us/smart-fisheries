package com.smartfisheries.repository;

import com.smartfisheries.entity.WaterQualityRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WaterQualityRecordRepository extends JpaRepository<WaterQualityRecord, Long> {
    List<WaterQualityRecord> findByPondIdOrderByRecordedAtDesc(Long pondId);
    List<WaterQualityRecord> findByPondIdAndRecordedAtBetweenOrderByRecordedAtAsc(
            Long pondId, LocalDateTime start, LocalDateTime end);
}
