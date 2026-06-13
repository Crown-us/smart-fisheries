package com.smartfisheries.mapper;

import com.smartfisheries.dto.NotificationDto;
import com.smartfisheries.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "user.id", target = "userId")
    NotificationDto.NotificationResponse toResponse(Notification notification);
}
