package com.ecomerce.repository;

import com.ecomerce.model.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    List<Carrito> findByUsuarioNumeroDocumento(String numeroDocumento);
    
    @Query("SELECT c FROM Carrito c JOIN FETCH c.producto JOIN FETCH c.usuario WHERE c.usuario.numeroDocumento = :numeroDocumento")
    List<Carrito> findByUsuarioNumeroDocumentoWithProducto(@Param("numeroDocumento") String numeroDocumento);
    
    Optional<Carrito> findByUsuarioNumeroDocumentoAndProductoId(String numeroDocumento, Long productoId);
    void deleteByUsuarioNumeroDocumento(String numeroDocumento);
    Optional<Carrito> findByUsuarioAndProducto(com.ecomerce.model.Usuario usuario, com.ecomerce.model.Producto producto);
    void deleteByUsuario(com.ecomerce.model.Usuario usuario);
    List<Carrito> findByProductoId(Long productoId);
}
