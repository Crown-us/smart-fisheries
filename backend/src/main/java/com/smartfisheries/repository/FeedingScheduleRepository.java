package com.smartfisheries.repository;

import com.smartfisheries.entity.FeedingSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedingScheduleRepository extends JpaRepository<FeedingSchedule, Long> {
    List<FeedingSchedule> findByPondId(Long pondId);
    List<FeedingSchedule> findByPondIdAndActiveTrue(Long pondId);
}
