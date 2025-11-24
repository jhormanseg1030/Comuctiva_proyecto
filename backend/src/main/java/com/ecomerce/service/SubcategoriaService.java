package com.ecomerce.service;

import com.ecomerce.model.Categoria;
import com.ecomerce.model.Subcategoria;
import com.ecomerce.repository.CategoriaRepository;
import com.ecomerce.repository.SubcategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubcategoriaService {

    @Autowired
    private SubcategoriaRepository subcategoriaRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    public Subcategoria crearSubcategoria(Subcategoria subcategoria) {
        return subcategoriaRepository.save(subcategoria);
    }

    public Optional<Subcategoria> obtenerSubcategoriaPorId(Long id) {
        return subcategoriaRepository.findById(id);
    }

    public List<Subcategoria> obtenerTodasSubcategorias() {
        return subcategoriaRepository.findAll();
    }

    public List<Subcategoria> obtenerSubcategoriasPorCategoria(Long categoriaId) {
        return subcategoriaRepository.findByCategoriaId(categoriaId);
    }

    public List<Subcategoria> obtenerSubcategoriasActivas() {
        return subcategoriaRepository.findByActivo(true);
    }

    public List<Subcategoria> obtenerSubcategoriasActivasPorCategoria(Long categoriaId) {
        return subcategoriaRepository.findByCategoriaIdAndActivo(categoriaId, true);
    }

    public Subcategoria actualizarSubcategoria(Long id, Subcategoria subcategoriaActualizada) {
        Subcategoria subcategoria = subcategoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));

        subcategoria.setNombre(subcategoriaActualizada.getNombre());
        subcategoria.setDescripcion(subcategoriaActualizada.getDescripcion());
        subcategoria.setActivo(subcategoriaActualizada.getActivo());

        if (subcategoriaActualizada.getCategoria() != null) {
            Categoria categoria = categoriaRepository.findById(subcategoriaActualizada.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            subcategoria.setCategoria(categoria);
        }

        return subcategoriaRepository.save(subcategoria);
    }

    public Subcategoria cambiarEstado(Long id, Boolean activo) {
        Subcategoria subcategoria = subcategoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));
        subcategoria.setActivo(activo);
        return subcategoriaRepository.save(subcategoria);
    }

    public void eliminarSubcategoria(Long id) {
        subcategoriaRepository.deleteById(id);
    }
}
