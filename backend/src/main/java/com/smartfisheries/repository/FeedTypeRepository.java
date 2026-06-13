package com.smartfisheries.repository;

import com.smartfisheries.entity.FeedType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedTypeRepository extends JpaRepository<FeedType, Long> {
    Optional<FeedType> findByName(String name);
}
