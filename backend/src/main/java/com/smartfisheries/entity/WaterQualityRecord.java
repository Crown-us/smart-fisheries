package com.smartfisheries.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_quality_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterQualityRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pond_id", nullable = false)
    private Pond pond;

    @Column(nullable = false)
    private Double ph;

    @Column(nullable = false)
    private Double temperature;

    @Column(name = "dissolved_oxygen", nullable = false)
    private Double dissolvedOxygen;

    @Column(nullable = false)
    private Double salinity;

    @Column(nullable = false)
    private Double ammonia;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by")
    private User recordedBy;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
