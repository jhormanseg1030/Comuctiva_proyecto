package com.ecomerce.repository;

import com.ecomerce.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByVendedorNumeroDocumento(String numeroDocumento);
    List<Venta> findByCompradorNumeroDocumento(String numeroDocumento);
    List<Venta> findByProductoId(Long productoId);
    List<Venta> findByFechaVentaBetween(LocalDateTime inicio, LocalDateTime fin);
}
