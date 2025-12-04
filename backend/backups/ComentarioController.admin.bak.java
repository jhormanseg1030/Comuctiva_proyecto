package com.ecomerce.controller;

import com.ecomerce.dto.ComentarioDTO;
import com.ecomerce.dto.MessageResponse;
import com.ecomerce.model.Comentario;
import com.ecomerce.service.ComentarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/comentarios")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ComentarioController {

    @Autowired
    private ComentarioService comentarioService;

    // Crear comentario
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> crearComentario(
            @RequestParam Long productoId,
            @RequestParam String comentario,
            @RequestParam Integer calificacion,
            Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            Comentario nuevoComentario = comentarioService.crearComentario(
                    productoId, numeroDocumento, comentario, calificacion);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(new ComentarioDTO(nuevoComentario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Obtener comentarios de un producto
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<?> obtenerComentariosPorProducto(@PathVariable Long productoId) {
        try {
            List<Comentario> comentarios = comentarioService.obtenerComentariosPorProducto(productoId);
            Double promedioCalificacion = comentarioService.calcularPromedioCalificacion(productoId);
            
            List<ComentarioDTO> comentariosDTO = comentarios.stream()
                    .map(ComentarioDTO::new)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("comentarios", comentariosDTO);
            response.put("totalComentarios", comentariosDTO.size());
            response.put("promedioCalificacion", Math.round(promedioCalificacion * 10.0) / 10.0);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Obtener mis comentarios
    @GetMapping("/mis-comentarios")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> obtenerMisComentarios(Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            List<Comentario> comentarios = comentarioService.obtenerComentariosPorUsuario(numeroDocumento);
            
            List<ComentarioDTO> comentariosDTO = comentarios.stream()
                    .map(ComentarioDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(comentariosDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Actualizar comentario
    @PutMapping("/{comentarioId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> actualizarComentario(
            @PathVariable Long comentarioId,
            @RequestParam(required = false) String comentario,
            @RequestParam(required = false) Integer calificacion,
            Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            Comentario comentarioActualizado = comentarioService.actualizarComentario(
                    comentarioId, numeroDocumento, comentario, calificacion);
            
            return ResponseEntity.ok(new ComentarioDTO(comentarioActualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Eliminar comentario
    @DeleteMapping("/{comentarioId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> eliminarComentario(
            @PathVariable Long comentarioId,
            Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            comentarioService.eliminarComentario(comentarioId, numeroDocumento);
            
            return ResponseEntity.ok(new MessageResponse("Comentario eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}