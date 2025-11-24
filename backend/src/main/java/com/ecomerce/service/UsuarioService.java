package com.ecomerce.service;

import com.ecomerce.model.Usuario;
import com.ecomerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        return usuarioRepository.findById(numeroDocumento);
    }

    public Optional<Usuario> obtenerUsuarioPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    public List<Usuario> obtenerTodosUsuarios() {
        return usuarioRepository.findAll();
    }

    public List<Usuario> obtenerUsuariosPorRol(Usuario.Rol rol) {
        return usuarioRepository.findByRol(rol);
    }

    public List<Usuario> obtenerUsuariosActivos() {
        return usuarioRepository.findByActivo(true);
    }

    public Usuario actualizarUsuario(String numeroDocumento, Usuario usuarioActualizado) {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

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
        usuario.setRol(nuevoRol);
        return usuarioRepository.save(usuario);
    }

    public Usuario cambiarEstado(String numeroDocumento, Boolean activo) {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setActivo(activo);
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(String numeroDocumento) {
        usuarioRepository.deleteById(numeroDocumento);
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
