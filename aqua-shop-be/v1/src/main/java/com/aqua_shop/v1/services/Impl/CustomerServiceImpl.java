package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.dto.req.CreateCustomerRequest;
import com.aqua_shop.v1.dto.req.UpdateCustomerRequest;
import com.aqua_shop.v1.dto.res.CustomerResponse;
import com.aqua_shop.v1.entity.Customer;
import com.aqua_shop.v1.entity.Role;
import com.aqua_shop.v1.enums.MembershipTier;
import com.aqua_shop.v1.enums.UserRole;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.mappers.CustomerMapper;
import com.aqua_shop.v1.repositories.CustomerRepository;
import com.aqua_shop.v1.services.CustomerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        String email = normalizeString(request.getEmail());
        if(email != null && customerRepository.existsByEmailIgnoreCase(email)) {
            throw new CustomException(ErrorCode.CUSTOMER_EMAIL_ALREADY_EXISTS,email);
        }
        String phoneNumber = request.getPhoneNumber();
        if(customerRepository.existsByPhoneNumber(phoneNumber)){
            throw new CustomException(ErrorCode.CUSTOMER_PHONE_ALREADY_EXISTS,phoneNumber);
        }

        Customer customer = customerMapper.toCustomer(request);
        customer.setEmail(email);
        customer.setPhoneNumber(phoneNumber);
        customer.setAddress(normalizeString(request.getAddress()));
        customer.setPasswordHash(request.getPassword() != null && !request.getPassword().trim().isEmpty()
                ? passwordEncoder.encode(request.getPassword().trim())
                : null);
        customer.setPoints(BigDecimal.ZERO);
        customer.setMembershipTier(MembershipTier.BRONZE);
        Role defaultRole = Role.builder().roleId(4).build();
        customer.setRole(defaultRole);
        return customerMapper.toCustomerResponse(customerRepository.save(customer));
    }

    @Override
    public CustomerResponse getCustomerById(String customerId){
        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.CUSTOMER_NOT_FOUND,customerId));
        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    public CustomerResponse updateCustomer(String customerId, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.CUSTOMER_NOT_FOUND, customerId));

        if(customerRepository.existsByEmailIgnoreCaseAndCustomerIdNot(customer.getEmail(),customer.getCustomerId())) {
            throw new CustomException(ErrorCode.CUSTOMER_EMAIL_ALREADY_EXISTS, customer.getEmail());
        }

        customerMapper.updateCustomer(customer, request);

        if (request.getAddress() != null) {
            customer.setAddress(normalizeString(request.getAddress()));
        }

        Customer updatedCustomer = customerRepository.save(customer);

        return customerMapper.toCustomerResponse(updatedCustomer);
    }

    @Override
    public CustomerResponse deleteCustomer(String customerId ) {
        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.CUSTOMER_NOT_FOUND, customerId));
        customerRepository.delete(customer);
        return null;
    }

    @Override
    public Page<CustomerResponse> filterCustomers(String search, String email, String phoneNumber, Pageable pageable){
        return customerRepository.findAll((root,query,cb)->{
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isEmpty()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                List<jakarta.persistence.criteria.Predicate> searchPredicates = new ArrayList<>();

                // Search in fullName
                searchPredicates.add(cb.like(cb.lower(root.get("fullName")), like));

                // Search in email (only if not null)
                jakarta.persistence.criteria.Predicate emailSearchPredicate = cb.and(
                        cb.isNotNull(root.get("email")),
                        cb.like(cb.lower(root.get("email")), like)
                );
                searchPredicates.add(emailSearchPredicate);

                // Search in phoneNumber (only if not null)
                jakarta.persistence.criteria.Predicate phoneSearchPredicate = cb.and(
                        cb.isNotNull(root.get("phoneNumber")),
                        cb.like(cb.lower(root.get("phoneNumber")), like)
                );
                searchPredicates.add(phoneSearchPredicate);

                // Combine search predicates with OR
                predicates.add(cb.or(searchPredicates.toArray(new jakarta.persistence.criteria.Predicate[0])));
            }

            if (email != null && !email.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("email")), email.trim().toLowerCase()));
            }

            if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("phoneNumber"), phoneNumber.trim()));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        },pageable).map(customerMapper::toCustomerResponse);
    }

    /**
     * Normalize string: trim and return null if empty
     */
    private String normalizeString(String value) {
        return (value != null && !value.trim().isEmpty()) ? value.trim() : null;
    }
}
