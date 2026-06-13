package com.smartfisheries.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fish_species")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FishSpecies {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "scientific_name", length = 150)
    private String scientificName;

    @Column(name = "optimal_ph_min")
    private Double optimalPhMin;

    @Column(name = "optimal_ph_max")
    private Double optimalPhMax;

    @Column(name = "optimal_temp_min")
    private Double optimalTempMin;

    @Column(name = "optimal_temp_max")
    private Double optimalTempMax;

    @Column(name = "optimal_do_min")
    private Double optimalDoMin;

    @Column(name = "optimal_do_max")
    private Double optimalDoMax;

    @Column(name = "optimal_salinity_min")
    private Double optimalSalinityMin;

    @Column(name = "optimal_salinity_max")
    private Double optimalSalinityMax;

    @Column(name = "optimal_ammonia_max")
    private Double optimalAmmoniaMax;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
