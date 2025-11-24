package com.ecomerce.repository;

import com.ecomerce.model.Comentario;
import com.ecomerce.model.Producto;
import com.ecomerce.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByProductoId(Long productoId);
    List<Comentario> findByUsuarioNumeroDocumento(String numeroDocumento);
    List<Comentario> findByProductoIdAndActivo(Long productoId, Boolean activo);
    List<Comentario> findByProductoIdOrderByFechaComentarioDesc(Long productoId);
    boolean existsByProductoAndUsuario(Producto producto, Usuario usuario);
}
