package com.ecomerce.repository;

import com.ecomerce.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// backup of original ProductoRepository
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoriaId(Long categoriaId);
    List<Producto> findBySubcategoriaId(Long subcategoriaId);
    List<Producto> findByUsuarioNumeroDocumento(String numeroDocumento);
    List<Producto> findByActivo(Boolean activo);
    List<Producto> findByCategoriaIdAndActivo(Long categoriaId, Boolean activo);
    List<Producto> findBySubcategoriaIdAndActivo(Long subcategoriaId, Boolean activo);
}
