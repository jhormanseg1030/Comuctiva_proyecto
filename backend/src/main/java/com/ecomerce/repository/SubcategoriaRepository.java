package com.ecomerce.repository;

import com.ecomerce.model.Subcategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubcategoriaRepository extends JpaRepository<Subcategoria, Long> {
    List<Subcategoria> findByCategoriaId(Long categoriaId);
    List<Subcategoria> findByActivo(Boolean activo);
    List<Subcategoria> findByCategoriaIdAndActivo(Long categoriaId, Boolean activo);
    Boolean existsByNombreAndCategoriaId(String nombre, Long categoriaId);
}
