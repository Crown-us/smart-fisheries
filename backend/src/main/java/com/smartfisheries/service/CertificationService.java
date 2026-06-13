package com.smartfisheries.service;

import com.smartfisheries.dto.CertificationDto;
import com.smartfisheries.entity.CertStatus;
import com.smartfisheries.entity.DigitalCertification;
import com.smartfisheries.entity.NotificationType;
import com.smartfisheries.entity.User;
import com.smartfisheries.exception.BadRequestException;
import com.smartfisheries.exception.ResourceNotFoundException;
import com.smartfisheries.mapper.DigitalCertificationMapper;
import com.smartfisheries.repository.DigitalCertificationRepository;
import com.smartfisheries.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificationService {

    private final DigitalCertificationRepository certificationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DigitalCertificationMapper mapper;

    @Transactional
    public CertificationDto.CertificationResponse submitCertification(Long farmerId, CertificationDto.CertificationRequest request) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));

        DigitalCertification certification = DigitalCertification.builder()
                .farmer(farmer)
                .title(request.title())
                .description(request.description())
                .documentUrl(request.documentUrl())
                .status(CertStatus.PENDING)
                .build();

        DigitalCertification saved = certificationRepository.save(certification);
        return mapper.toResponse(saved);
    }

    public List<CertificationDto.CertificationResponse> getFarmerCertifications(Long farmerId) {
        return certificationRepository.findByFarmerId(farmerId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CertificationDto.CertificationResponse> getPendingCertifications() {
        return certificationRepository.findByStatus(CertStatus.PENDING).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public CertificationDto.CertificationResponse reviewCertification(Long adminId, Long certId, CertificationDto.ReviewCertificationRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin reviewer not found"));

        DigitalCertification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certification request not found"));

        if (cert.getStatus() != CertStatus.PENDING) {
            throw new BadRequestException("This certification request has already been reviewed");
        }

        cert.setStatus(request.status());
        cert.setReviewer(admin);
        cert.setReviewNotes(request.reviewNotes());
        cert.setReviewedAt(LocalDateTime.now());

        // Save certificate
        DigitalCertification updated = certificationRepository.save(cert);

        // If approved, verify the farmer user account
        if (request.status() == CertStatus.APPROVED) {
            User farmer = cert.getFarmer();
            farmer.setVerified(true);
            userRepository.save(farmer);

            // Notify farmer
            notificationService.createNotification(
                    farmer,
                    "Certification Approved!",
                    String.format("Your certification request '%s' has been approved. You now have a verified badge!", cert.getTitle()),
                    NotificationType.INFO
            );
        } else if (request.status() == CertStatus.REJECTED) {
            // Notify farmer of rejection
            notificationService.createNotification(
                    cert.getFarmer(),
                    "Certification Rejected",
                    String.format("Your certification request '%s' was rejected. Reason: %s", cert.getTitle(), request.reviewNotes()),
                    NotificationType.ALERT
            );
        }

        return mapper.toResponse(updated);
    }
}
