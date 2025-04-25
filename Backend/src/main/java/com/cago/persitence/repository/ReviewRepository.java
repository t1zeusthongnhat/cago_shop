package com.cago.persitence.repository;

import com.cago.persitence.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long>, JpaSpecificationExecutor<Review> {

    @EntityGraph(attributePaths = {"product", "user"})
    Page<Review> findByProduct_Id(Long productId, Pageable pageable); // Phân trang theo product ID

    @EntityGraph(attributePaths = {"product", "user"})
    Page<Review> findByUser_Id(Long userId, Pageable pageable); // Phân trang theo user ID
}

