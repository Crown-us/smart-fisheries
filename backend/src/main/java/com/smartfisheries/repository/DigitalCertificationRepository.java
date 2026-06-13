package com.smartfisheries.repository;

import com.smartfisheries.entity.CertStatus;
import com.smartfisheries.entity.DigitalCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalCertificationRepository extends JpaRepository<DigitalCertification, Long> {
    List<DigitalCertification> findByFarmerId(Long farmerId);
    List<DigitalCertification> findByStatus(CertStatus status);
    List<DigitalCertification> findByFarmerIdAndStatus(Long farmerId, CertStatus status);
}
