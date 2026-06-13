package com.smartfisheries.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ponds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pond {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String location;

    @Column(name = "length_m", nullable = false)
    private Double length;

    @Column(name = "width_m", nullable = false)
    private Double width;

    @Column(name = "depth_m", nullable = false)
    private Double depth;

    @Column(name = "water_source", length = 100)
    private String waterSource;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PondStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
