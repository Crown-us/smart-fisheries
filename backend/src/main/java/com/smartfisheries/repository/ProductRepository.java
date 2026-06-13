package com.smartfisheries.repository;

import com.smartfisheries.entity.ProductCategory;
import com.smartfisheries.entity.ProductModerationStatus;
import com.smartfisheries.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFarmerId(Long farmerId);
    List<Product> findByModerationStatus(ProductModerationStatus status);
    List<Product> findByCategoryAndModerationStatus(ProductCategory category, ProductModerationStatus status);

    @Query("SELECT p FROM Product p WHERE p.moderationStatus = 'APPROVED' AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("query") String query);
}
