package com.smartfisheries.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fcr_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FcrRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pond_stock_id", nullable = false)
    private PondStock pondStock;

    @Column(name = "calculation_date", nullable = false)
    private LocalDate calculationDate;

    @Column(name = "total_feed_given_kg", nullable = false)
    private Double totalFeedGivenKg;

    @Column(name = "total_biomass_gain_kg", nullable = false)
    private Double totalBiomassGainKg;

    @Column(name = "fcr_value", nullable = false)
    private Double fcrValue;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
