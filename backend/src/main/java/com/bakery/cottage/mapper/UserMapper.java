package com.bakery.cottage.mapper;

import com.bakery.cottage.dto.UserDTO;
import com.bakery.cottage.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserDTO toDto(User user);
}
