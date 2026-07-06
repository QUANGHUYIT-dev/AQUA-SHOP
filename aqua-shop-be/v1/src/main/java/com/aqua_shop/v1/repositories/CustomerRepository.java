package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.Customer;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer,String>, JpaSpecificationExecutor<Customer> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByPhoneNumber(String phoneNumber);
    List<Customer> findAllByPhoneNumber(String phoneNumber);
    Optional<Customer> findByCustomerId(String customerId);


    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByEmailIgnoreCaseAndCustomerIdNot(String email, String customerId);
    boolean existsByPhoneNumberAndCustomerIdNot(String phoneNumber, String customerId);
    /**
     * Pessimistic lock for wallet balance updates (top-up / payment) to avoid concurrent overspend or lost updates.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Customer c WHERE c.customerId = :customerId")
    Optional<Customer> lockByIdForWalletUpdate(@Param("customerId") String customerId);
}
