package com.ecomerce.controller;

import com.ecomerce.dto.JwtResponse;
import com.ecomerce.dto.LoginRequest;
import com.ecomerce.dto.MessageResponse;
import com.ecomerce.dto.RegisterRequest;
import com.ecomerce.model.Usuario;
import com.ecomerce.security.JwtUtils;
import com.ecomerce.security.UserDetailsImpl;
import com.ecomerce.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getNumeroDocumento(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String rol = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        Usuario usuario = usuarioService.obtenerUsuarioPorDocumento(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getUsername(),
                userDetails.getCorreo(),
                rol.replace("ROLE_", ""),
                usuario.getNombre(),
                usuario.getApellido()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (usuarioService.existeDocumento(registerRequest.getNumeroDocumento())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: El número de documento ya está registrado"));
        }

        if (usuarioService.existeCorreo(registerRequest.getCorreo())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: El correo ya está registrado"));
        }

        Usuario usuario = new Usuario();
        usuario.setNumeroDocumento(registerRequest.getNumeroDocumento());
        usuario.setTipoDocumento(registerRequest.getTipoDocumento());
        usuario.setPassword(registerRequest.getPassword());
        usuario.setNombre(registerRequest.getNombre());
        usuario.setApellido(registerRequest.getApellido());
        usuario.setTelefono(registerRequest.getTelefono());
        usuario.setDireccion(registerRequest.getDireccion());
        usuario.setCorreo(registerRequest.getCorreo());

        String rol = registerRequest.getRol();
        if (rol == null || rol.isEmpty()) {
            rol = "USER";
        }
        usuario.setRol(Usuario.Rol.valueOf(rol.toUpperCase()));

        usuarioService.crearUsuario(usuario);

        return ResponseEntity.ok(new MessageResponse("Usuario registrado exitosamente"));
    }
}
