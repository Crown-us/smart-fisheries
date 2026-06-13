package com.smartfisheries.mapper;

import com.smartfisheries.dto.AuthDto;
import com.smartfisheries.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "accessToken", ignore = true)
    @Mapping(target = "refreshToken", ignore = true)
    @Mapping(source = "id", target = "userId")
    @Mapping(source = "role", target = "role")
    AuthDto.AuthResponse toAuthResponse(User user);
}
