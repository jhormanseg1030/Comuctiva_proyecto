package com.ecomerce.controller;

import com.ecomerce.dto.ComentarioDTO;
import com.ecomerce.dto.MessageResponse;
import com.ecomerce.model.Comentario;
import com.ecomerce.service.ComentarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/comentarios")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminComentarioController {

    @Autowired
    private ComentarioService comentarioService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listarComentariosAdmin(
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) String usuarioDocumento,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String q
    ) {
        java.util.List<com.ecomerce.dto.AdminComentarioDTO> lista = comentarioService.listarComentariosAdminDto(productoId, usuarioDocumento, activo, q);
        return ResponseEntity.ok(lista);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarComentarioAdmin(@PathVariable Long id, Principal principal) {
        comentarioService.eliminarComentarioPorAdmin(id, principal.getName());
        return ResponseEntity.ok(new MessageResponse("Comentario eliminado por admin"));
    }

    @PutMapping("/{id}/restaurar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restaurarComentario(@PathVariable Long id) {
        comentarioService.restaurarComentario(id);
        return ResponseEntity.ok(new MessageResponse("Comentario restaurado"));
    }

    @PutMapping("/restaurar-todos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restaurarTodosComentarios() {
        comentarioService.restaurarTodosComentarios();
        return ResponseEntity.ok(new MessageResponse("Todos los comentarios han sido restaurados"));
    }
}
