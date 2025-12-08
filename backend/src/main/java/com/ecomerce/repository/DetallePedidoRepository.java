package com.ecomerce.repository;

import com.ecomerce.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {
    List<DetallePedido> findByPedidoId(Long pedidoId);
    List<DetallePedido> findByVendedorNumeroDocumento(String numeroDocumento);
    List<DetallePedido> findByProductoId(Long productoId);

    // Devuelve los detalles del producto donde el pedido asociado NO está en el estado proporcionado
    @Query("SELECT d FROM DetallePedido d JOIN d.pedido p WHERE d.producto.id = :productoId AND p.estado <> :estado")
    List<DetallePedido> findByProductoIdWherePedidoNotCancel(@Param("productoId") Long productoId, @Param("estado") com.ecomerce.model.Pedido.EstadoPedido estado);
}
