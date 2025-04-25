package com.cago.persitence.repository;
import com.cago.persitence.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image,Long> {
    List<Image> findByProductId(Long productId);
    boolean existsByUrl(String url);
}
