package com.ecomerce.service;

import com.ecomerce.model.Usuario;
import com.ecomerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public Usuario crearUsuario(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> obtenerUsuarioPorDocumento(String numeroDocumento) {
        return usuarioRepository.findById(numeroDocumento);
    }

    public Optional<Usuario> obtenerUsuarioPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    public List<Usuario> obtenerTodosUsuarios() {
        return usuarioRepository.findAll().stream()
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

    @Transactional
    public void eliminarUsuario(String numeroDocumento, String adminDocumento) {
        logger.info("Iniciando eliminación de usuario: {}, solicitado por: {}", numeroDocumento, adminDocumento);
        
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Prevent self-delete
        if (usuario.getNumeroDocumento().equals(adminDocumento)) {
            logger.warn("Intento de auto-eliminación por: {}", adminDocumento);
            throw new RuntimeException("No puedes eliminarte a ti mismo");
        }

        // If target is ADMIN, ensure there is at least one other ADMIN
        if (usuario.getRol() == Usuario.Rol.ADMIN) {
            long adminCount = usuarioRepository.findByRol(Usuario.Rol.ADMIN).size();
            if (adminCount <= 1) {
                logger.warn("Intento de eliminar el último administrador: {}", numeroDocumento);
                throw new RuntimeException("No se puede eliminar el último administrador");
            }
        }

        logger.info("Eliminando físicamente usuario de la BD: {}", numeroDocumento);
        usuarioRepository.delete(usuario);
        entityManager.flush();
        
        logger.info("Usuario eliminado exitosamente de la BD: {}", numeroDocumento);
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
