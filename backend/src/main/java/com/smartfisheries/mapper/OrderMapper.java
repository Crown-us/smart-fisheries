package com.smartfisheries.mapper;

import com.smartfisheries.dto.MarketplaceDto;
import com.smartfisheries.entity.Order;
import com.smartfisheries.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "consumer.id", target = "consumerId")
    @Mapping(target = "consumerName", expression = "java(order.getConsumer() != null ? order.getConsumer().getFirstName() + \" \" + order.getConsumer().getLastName() : null)")
    @Mapping(source = "items", target = "items")
    MarketplaceDto.OrderResponse toOrderResponse(Order order);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    MarketplaceDto.OrderItemResponse toOrderItemResponse(OrderItem item);
}
