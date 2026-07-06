package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.CreateCustomerRequest;
import com.aqua_shop.v1.dto.req.UpdateCustomerRequest;
import com.aqua_shop.v1.dto.res.CustomerResponse;
import com.aqua_shop.v1.services.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request) {
            ApiResponse<CustomerResponse> apiResponse = ApiResponse.<CustomerResponse>builder()
                    .message("Create Customer Successfully")
                    .data(customerService.createCustomer(request))
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable String customerId) {
        ApiResponse<CustomerResponse> apiResponse = ApiResponse.<CustomerResponse>builder()
                .message("Get customer by id successfully")
                .data(customerService.getCustomerById(customerId))
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }

    @PatchMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable String customerId,
            @Valid @RequestBody UpdateCustomerRequest request) {
        ApiResponse<CustomerResponse> apiResponse = ApiResponse.<CustomerResponse>builder()
                .message("Update Customer Successfully")
                .data(customerService.updateCustomer(customerId,request))
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }

    @DeleteMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> deleteCustomer(@PathVariable String customerId) {
        // Hứng dữ liệu từ service trả về
        CustomerResponse deletedData = customerService.deleteCustomer(customerId);

        ApiResponse<CustomerResponse> apiResponse = ApiResponse.<CustomerResponse>builder()
                .message("Delete Customer Successfully")
                .data(deletedData) // Gửi kèm dữ liệu đã xóa
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<?>> filterCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phoneNumber,
            @PageableDefault(size = 10, page = 0, sort = "fullName", direction = Sort.Direction.ASC) Pageable pageable){
        ApiResponse<?> apiResponse =  ApiResponse.builder()
                .message("Filter customers successfully")
                .data(customerService.filterCustomers(search,email,phoneNumber,pageable))
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }
}
