package com.aqua_shop.v1.mappers;

import com.aqua_shop.v1.dto.req.CreateCustomerRequest;
import com.aqua_shop.v1.dto.req.CustomerSignUpRequest;
import com.aqua_shop.v1.dto.req.UpdateCustomerRequest;
import com.aqua_shop.v1.dto.res.CustomerResponse;
import com.aqua_shop.v1.entity.Customer;
import org.mapstruct.*;

import java.util.Optional;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "role", source = "role.roleName")
    CustomerResponse toCustomerResponse(Customer customer);

    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "membershipTier", ignore = true)
    @Mapping(target = "points", ignore = true)
    @Mapping(target = "walletBalance", ignore = true)
    @Mapping(target = "isLocked", ignore = true)
    @Mapping(target = "role", ignore = true)
    Customer toCustomer(CreateCustomerRequest request);

    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "points", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "isLocked", ignore = true)
    @Mapping(target = "role", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateCustomer(@MappingTarget Customer customer, UpdateCustomerRequest request);

    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "membershipTier", ignore = true)
    @Mapping(target = "points", ignore = true)
    @Mapping(target = "walletBalance", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "isLocked", ignore = true)
    @Mapping(target = "role", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Customer toCustomer(CustomerSignUpRequest request);
}
