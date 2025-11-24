package com.ecomerce.repository;

import com.ecomerce.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {
    List<Compra> findByCompradorNumeroDocumento(String numeroDocumento);
    List<Compra> findByProductoId(Long productoId);
    List<Compra> findByFechaCompraBetween(LocalDateTime inicio, LocalDateTime fin);
    List<Compra> findByEstado(Compra.EstadoCompra estado);
}
