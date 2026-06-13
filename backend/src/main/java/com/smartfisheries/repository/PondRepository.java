package com.smartfisheries.repository;

import com.smartfisheries.entity.Pond;
import com.smartfisheries.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PondRepository extends JpaRepository<Pond, Long> {
    List<Pond> findByFarmer(User farmer);
    List<Pond> findByFarmerId(Long farmerId);
}
