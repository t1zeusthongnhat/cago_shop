package com.cago.persitence.repository;

import com.cago.persitence.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment,Long> {
    // Lấy danh sách Shipment theo Order ID
    List<Shipment> findByOrder_Id(Long orderId);
}
