package com.ecomerce.controller;

import com.ecomerce.dto.MessageResponse;
import com.ecomerce.dto.SubcategoriaDTO;
import com.ecomerce.model.Subcategoria;
import com.ecomerce.service.SubcategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/subcategorias")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SubcategoriaController {

    @Autowired
    private SubcategoriaService subcategoriaService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<SubcategoriaDTO>> obtenerTodasSubcategorias() {
        List<SubcategoriaDTO> subcategorias = subcategoriaService.obtenerTodasSubcategorias()
                .stream()
                .map(SubcategoriaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subcategorias);
    }

    @GetMapping("/activas")
    @Transactional(readOnly = true)
    public ResponseEntity<List<SubcategoriaDTO>> obtenerSubcategoriasActivas() {
        List<SubcategoriaDTO> subcategorias = subcategoriaService.obtenerSubcategoriasActivas()
                .stream()
                .map(SubcategoriaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subcategorias);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerSubcategoria(@PathVariable Long id) {
        return subcategoriaService.obtenerSubcategoriaPorId(id)
                .map(sub -> ResponseEntity.ok(new SubcategoriaDTO(sub)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categoria/{categoriaId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<SubcategoriaDTO>> obtenerSubcategoriasPorCategoria(@PathVariable Long categoriaId) {
        List<SubcategoriaDTO> subcategorias = subcategoriaService.obtenerSubcategoriasPorCategoria(categoriaId)
                .stream()
                .map(SubcategoriaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subcategorias);
    }

    @GetMapping("/categoria/{categoriaId}/activas")
    @Transactional(readOnly = true)
    public ResponseEntity<List<SubcategoriaDTO>> obtenerSubcategoriasActivasPorCategoria(@PathVariable Long categoriaId) {
        List<SubcategoriaDTO> subcategorias = subcategoriaService.obtenerSubcategoriasActivasPorCategoria(categoriaId)
                .stream()
                .map(SubcategoriaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subcategorias);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crearSubcategoria(@Valid @RequestBody Subcategoria subcategoria) {
        Subcategoria nuevaSubcategoria = subcategoriaService.crearSubcategoria(subcategoria);
        return ResponseEntity.ok(nuevaSubcategoria);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarSubcategoria(@PathVariable Long id, @Valid @RequestBody Subcategoria subcategoria) {
        try {
            Subcategoria subcategoriaActualizada = subcategoriaService.actualizarSubcategoria(id, subcategoria);
            return ResponseEntity.ok(subcategoriaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam Boolean activo) {
        try {
            Subcategoria subcategoria = subcategoriaService.cambiarEstado(id, activo);
            return ResponseEntity.ok(subcategoria);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarSubcategoria(@PathVariable Long id) {
        subcategoriaService.eliminarSubcategoria(id);
        return ResponseEntity.ok(new MessageResponse("Subcategoría eliminada exitosamente"));
    }
}
