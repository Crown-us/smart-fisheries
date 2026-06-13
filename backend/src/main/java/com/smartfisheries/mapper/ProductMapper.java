package com.smartfisheries.mapper;

import com.smartfisheries.dto.MarketplaceDto;
import com.smartfisheries.entity.Product;
import com.smartfisheries.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "farmer.id", target = "farmerId")
    @Mapping(target = "farmerName", expression = "java(product.getFarmer() != null ? product.getFarmer().getFirstName() + \" \" + product.getFarmer().getLastName() : null)")
    @Mapping(source = "images", target = "images")
    MarketplaceDto.ProductResponse toProductResponse(Product product);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "imageUrl", target = "imageUrl")
    @Mapping(source = "primary", target = "primary")
    MarketplaceDto.ProductImageResponse toProductImageResponse(ProductImage image);
}
