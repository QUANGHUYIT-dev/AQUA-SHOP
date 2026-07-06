package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.req.CreateCustomerRequest;
import com.aqua_shop.v1.dto.req.UpdateCustomerRequest;
import com.aqua_shop.v1.dto.res.CustomerResponse;
import com.aqua_shop.v1.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface CustomerService {
//    Customer getCurrentCustomer();

    CustomerResponse getCustomerById(String customerId);

//    CustomerResponse getMyProfile();

    CustomerResponse createCustomer(CreateCustomerRequest request);

    CustomerResponse updateCustomer(String customerId, UpdateCustomerRequest request);
    CustomerResponse deleteCustomer(String customerId);

    Page<CustomerResponse> filterCustomers(String search, String email, String phoneNumber, Pageable pageable);
//
//    CustomerResponse updateCustomerImage(String customerId, UpdateCustomerImageRequest request);
//
//    List<CustomerImageResponse> getAllCustomerImages();
//
//    UpdateProfileResponse updateProfile(UpdateProfileRequest request);
}
