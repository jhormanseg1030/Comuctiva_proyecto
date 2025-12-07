// Backup before adding @Transactional - Dec 6, 2025
package com.ecomerce.service;

import com.ecomerce.model.Usuario;
import com.ecomerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario crearUsuario(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> obtenerUsuarioPorDocumento(String numeroDocumento) {
        return usuarioRepository.findById(numeroDocumento)
                .filter(u -> !Boolean.TRUE.equals(u.getDeleted()));
    }

    public Optional<Usuario> obtenerUsuarioPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .filter(u -> !Boolean.TRUE.equals(u.getDeleted()));
    }

    public List<Usuario> obtenerTodosUsuarios() {
        return usuarioRepository.findAll().stream()
                .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
                .collect(Collectors.toList());
    }

    public List<Usuario> obtenerUsuariosPorRol(Usuario.Rol rol) {
        return usuarioRepository.findByRol(rol).stream()
                .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
                .collect(Collectors.toList());
    }

    public List<Usuario> obtenerUsuariosActivos() {
        return usuarioRepository.findByActivo(true).stream()
                .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
                .collect(Collectors.toList());
    }

    public Usuario actualizarUsuario(String numeroDocumento, Usuario usuarioActualizado) {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (Boolean.TRUE.equals(usuario.getDeleted())) {
            throw new RuntimeException("Usuario no encontrado");
        }

        usuario.setTipoDocumento(usuarioActualizado.getTipoDocumento());
        usuario.setNombre(usuarioActualizado.getNombre());
        usuario.setApellido(usuarioActualizado.getApellido());
        usuario.setTelefono(usuarioActualizado.getTelefono());
        usuario.setDireccion(usuarioActualizado.getDireccion());
        usuario.setCorreo(usuarioActualizado.getCorreo());

        if (usuarioActualizado.getPassword() != null && !usuarioActualizado.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioActualizado.getPassword()));
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario cambiarRol(String numeroDocumento, Usuario.Rol nuevoRol) {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (Boolean.TRUE.equals(usuario.getDeleted())) {
            throw new RuntimeException("Usuario no encontrado");
        }
        usuario.setRol(nuevoRol);
        return usuarioRepository.save(usuario);
    }

    public Usuario cambiarEstado(String numeroDocumento, Boolean activo) {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (Boolean.TRUE.equals(usuario.getDeleted())) {
            throw new RuntimeException("Usuario no encontrado");
        }
        usuario.setActivo(activo);
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(String numeroDocumento, String adminDocumento) {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (Boolean.TRUE.equals(usuario.getDeleted())) {
            throw new RuntimeException("Usuario no encontrado");
        }

        // Prevent self-delete
        if (usuario.getNumeroDocumento().equals(adminDocumento)) {
            throw new RuntimeException("No puedes eliminarte a ti mismo");
        }

        // If target is ADMIN, ensure there is at least one other non-deleted ADMIN
        if (usuario.getRol() == Usuario.Rol.ADMIN) {
            long adminCount = usuarioRepository.findByRol(Usuario.Rol.ADMIN).stream()
                    .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("No se puede eliminar el último administrador");
            }
        }

        usuario.setDeleted(true);
        usuario.setDeletedAt(LocalDateTime.now());
        usuario.setDeletedBy(adminDocumento);
        usuarioRepository.save(usuario);
    }

    public Boolean existeCorreo(String correo) {
        return usuarioRepository.existsByCorreo(correo);
    }

    public Boolean existeDocumento(String numeroDocumento) {
        return usuarioRepository.existsByNumeroDocumento(numeroDocumento);
    }

    public Usuario cambiarPassword(String numeroDocumento, String passwordActual, String passwordNueva) {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        // Actualizar con la nueva contraseña
        usuario.setPassword(passwordEncoder.encode(passwordNueva));
        return usuarioRepository.save(usuario);
    }
}
