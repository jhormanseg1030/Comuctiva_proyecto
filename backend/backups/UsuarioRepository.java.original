package com.ecomerce.repository;

import com.ecomerce.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByCorreo(String correo);
    Boolean existsByCorreo(String correo);
    Boolean existsByNumeroDocumento(String numeroDocumento);
    List<Usuario> findByRol(Usuario.Rol rol);
    List<Usuario> findByActivo(Boolean activo);
}
