package com.ecomerce.repository;

import com.ecomerce.model.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, Long> {
    List<Promocion> findByProductoId(Long productoId);
    List<Promocion> findByCreadorNumeroDocumento(String numeroDocumento);
    List<Promocion> findByActivo(Boolean activo);
    
    @Query("SELECT p FROM Promocion p WHERE p.activo = true AND p.fechaInicio <= :now AND p.fechaVencimiento >= :now")
    List<Promocion> findPromocionesVigentes(LocalDateTime now);
    
    @Query("SELECT p FROM Promocion p WHERE p.producto.id = :productoId AND p.activo = true AND p.fechaInicio <= :now AND p.fechaVencimiento >= :now")
    List<Promocion> findPromocionesVigentesByProducto(Long productoId, LocalDateTime now);
}
