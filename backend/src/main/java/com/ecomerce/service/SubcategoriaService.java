package com.ecomerce.service;

import com.ecomerce.dto.SubcategoriaDTO;
import com.ecomerce.dto.SubcategoriaRequest;
import com.ecomerce.model.Categoria;
import com.ecomerce.model.Subcategoria;
import com.ecomerce.repository.CategoriaRepository;
import com.ecomerce.repository.SubcategoriaRepository;
import com.ecomerce.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SubcategoriaService {

    @Autowired
    private SubcategoriaRepository subcategoriaRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public Subcategoria crearSubcategoria(Subcategoria subcategoria) {
        // Validar unicidad por nombre dentro de la categoría
        if (subcategoria.getCategoria() != null && subcategoria.getNombre() != null) {
            Long catId = subcategoria.getCategoria().getId();
            if (catId != null && subcategoriaRepository.existsByNombreAndCategoriaId(subcategoria.getNombre(), catId)) {
                throw new RuntimeException("Ya existe una subcategoría con ese nombre en la categoría seleccionada");
            }
        }
        return subcategoriaRepository.save(subcategoria);
    }

    @Transactional(readOnly = true)
    public Optional<Subcategoria> obtenerSubcategoriaPorId(Long id) {
        return subcategoriaRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Subcategoria> obtenerTodasSubcategorias() {
        return subcategoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Subcategoria> obtenerSubcategoriasPorCategoria(Long categoriaId) {
        return subcategoriaRepository.findByCategoriaId(categoriaId);
    }

    @Transactional(readOnly = true)
    public List<Subcategoria> obtenerSubcategoriasActivas() {
        return subcategoriaRepository.findByActivo(true);
    }

    @Transactional(readOnly = true)
    public List<Subcategoria> obtenerSubcategoriasActivasPorCategoria(Long categoriaId) {
        return subcategoriaRepository.findByCategoriaIdAndActivo(categoriaId, true);
    }

    // New: create from DTO and return DTO (mapping inside transaction to avoid lazy init issues)
    @Transactional
    public SubcategoriaDTO crearSubcategoriaDesdeRequest(SubcategoriaRequest req) {
        if (req.getNombre() == null || req.getCategoriaId() == null) {
            throw new RuntimeException("Nombre y categoriaId son requeridos");
        }

        if (subcategoriaRepository.existsByNombreAndCategoriaId(req.getNombre(), req.getCategoriaId())) {
            throw new RuntimeException("Ya existe una subcategoría con ese nombre en la categoría seleccionada");
        }

        Categoria categoria = categoriaRepository.findById(req.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Subcategoria sub = new Subcategoria();
        sub.setNombre(req.getNombre());
        sub.setDescripcion(req.getDescripcion());
        sub.setCategoria(categoria);
        sub.setActivo(req.getActivo() != null ? req.getActivo() : true);

        Subcategoria saved = subcategoriaRepository.save(sub);
        return new SubcategoriaDTO(saved);
    }

    @Transactional
    public SubcategoriaDTO actualizarSubcategoriaDesdeRequest(Long id, SubcategoriaRequest req) {
        Subcategoria subcategoria = subcategoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));

        // Validar unicidad si cambia nombre o categoria
        if (req.getNombre() != null && req.getCategoriaId() != null) {
            Long newCatId = req.getCategoriaId();
            if (newCatId != null && !subcategoria.getNombre().equals(req.getNombre())
                    && subcategoriaRepository.existsByNombreAndCategoriaId(req.getNombre(), newCatId)) {
                throw new RuntimeException("Ya existe una subcategoría con ese nombre en la categoría seleccionada");
            }
        }

        if (req.getNombre() != null) subcategoria.setNombre(req.getNombre());
        subcategoria.setDescripcion(req.getDescripcion());
        if (req.getActivo() != null) subcategoria.setActivo(req.getActivo());

        if (req.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(req.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            subcategoria.setCategoria(categoria);
        }

        Subcategoria saved = subcategoriaRepository.save(subcategoria);
        return new SubcategoriaDTO(saved);
    }

    @Transactional
    public SubcategoriaDTO cambiarEstadoDTO(Long id, Boolean activo) {
        Subcategoria subcategoria = subcategoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));
        subcategoria.setActivo(activo);
        Subcategoria saved = subcategoriaRepository.save(subcategoria);
        return new SubcategoriaDTO(saved);
    }

    public Subcategoria actualizarSubcategoria(Long id, Subcategoria subcategoriaActualizada) {
        Subcategoria subcategoria = subcategoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));

        // Validar unicidad si cambia nombre o categoria
        if (subcategoriaActualizada.getNombre() != null && subcategoriaActualizada.getCategoria() != null) {
            Long newCatId = subcategoriaActualizada.getCategoria().getId();
            if (newCatId != null && !subcategoria.getNombre().equals(subcategoriaActualizada.getNombre())
                    && subcategoriaRepository.existsByNombreAndCategoriaId(subcategoriaActualizada.getNombre(), newCatId)) {
                throw new RuntimeException("Ya existe una subcategoría con ese nombre en la categoría seleccionada");
            }
        }

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
        // Verificar si existen productos asociados a la subcategoría
        int productos = productoRepository.countBySubcategoriaId(id);
        if (productos > 0) {
            throw new RuntimeException("No se puede eliminar: existen productos asociados a esta subcategoría. Desactívela o reasigne los productos.");
        }

        subcategoriaRepository.deleteById(id);
    }
}
