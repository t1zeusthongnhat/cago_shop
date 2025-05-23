package com.cago.persitence.repository;

import com.cago.persitence.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart,Long> {

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems WHERE c.user.id = :userId AND c.status = :status")
    Optional<Cart> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Cart.CartStatus status);

}
