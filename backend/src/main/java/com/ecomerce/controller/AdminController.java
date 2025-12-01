package com.ecomerce.controller;

import com.ecomerce.model.Usuario;
import com.ecomerce.service.ProductoService;
import com.ecomerce.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ProductoService productoService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSummary() {
        Map<String, Object> data = new HashMap<>();
        List<Usuario> usuarios = usuarioService.obtenerTodosUsuarios();
        data.put("usuariosTotal", usuarios.size());
        data.put("usuariosActivos", usuarioService.obtenerUsuariosActivos().size());
        data.put("productosTotal", productoService.obtenerTodosProductos().size());

        return ResponseEntity.ok(data);
    }

    @GetMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> listUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerTodosUsuarios());
    }
}
