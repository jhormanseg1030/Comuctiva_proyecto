package com.ecomerce.controller;

import com.ecomerce.dto.MessageResponse;
import com.ecomerce.model.Usuario;
import com.ecomerce.service.UsuarioService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> obtenerTodosUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerTodosUsuarios());
    }

    @GetMapping("/{numeroDocumento}")
    @PreAuthorize("hasRole('ADMIN') or #numeroDocumento == authentication.principal.username")
    public ResponseEntity<?> obtenerUsuario(@PathVariable String numeroDocumento) {
        return usuarioService.obtenerUsuarioPorDocumento(numeroDocumento)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Usuario>> obtenerUsuariosActivos() {
        return ResponseEntity.ok(usuarioService.obtenerUsuariosActivos());
    }

    @PutMapping("/{numeroDocumento}")
    @PreAuthorize("hasRole('ADMIN') or #numeroDocumento == authentication.principal.username")
    public ResponseEntity<?> actualizarUsuario(@PathVariable String numeroDocumento, @Valid @RequestBody Usuario usuario) {
        try {
            Usuario usuarioActualizado = usuarioService.actualizarUsuario(numeroDocumento, usuario);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{numeroDocumento}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cambiarRol(@PathVariable String numeroDocumento, @RequestParam String rol) {
        try {
            Usuario usuario = usuarioService.cambiarRol(numeroDocumento, Usuario.Rol.valueOf(rol.toUpperCase()));
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{numeroDocumento}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cambiarEstado(@PathVariable String numeroDocumento, @RequestParam Boolean activo) {
        try {
            Usuario usuario = usuarioService.cambiarEstado(numeroDocumento, activo);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{numeroDocumento}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarUsuario(@PathVariable String numeroDocumento) {
        usuarioService.eliminarUsuario(numeroDocumento);
        return ResponseEntity.ok(new MessageResponse("Usuario eliminado exitosamente"));
    }

    @PutMapping("/{numeroDocumento}/cambiar-password")
    @PreAuthorize("hasRole('ADMIN') or #numeroDocumento == authentication.principal.username")
    public ResponseEntity<?> cambiarPassword(
            @PathVariable String numeroDocumento,
            @RequestBody PasswordChangeRequest request) {
        try {
            Usuario usuario = usuarioService.cambiarPassword(
                numeroDocumento, 
                request.getPasswordActual(), 
                request.getPasswordNueva()
            );
            return ResponseEntity.ok(new MessageResponse("Contraseña actualizada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Clase interna para el request
    @Data
    public static class PasswordChangeRequest {
        private String passwordActual;
        private String passwordNueva;
    }
}
