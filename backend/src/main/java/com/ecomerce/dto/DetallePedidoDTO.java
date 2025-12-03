package com.ecomerce.dto;

import com.ecomerce.model.DetallePedido;
import java.util.HashMap;
import java.util.Map;

public class DetallePedidoDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal;
    private Map<String, Object> producto;
    private Map<String, Object> pedido;

    public DetallePedidoDTO() {
    }

    public DetallePedidoDTO(DetallePedido detalle) {
        this.id = detalle.getId();
        this.productoId = detalle.getProducto().getId();
        this.productoNombre = detalle.getProducto().getNombre();
        this.cantidad = detalle.getCantidad();
        this.precioUnitario = detalle.getPrecioUnitario().doubleValue();
        this.subtotal = detalle.getSubtotal().doubleValue();
        
        // Crear objeto producto para compatibilidad con frontend
        this.producto = new HashMap<>();
        this.producto.put("id", detalle.getProducto().getId());
        this.producto.put("nombre", detalle.getProducto().getNombre());
        
        // Crear objeto pedido con información básica
        if (detalle.getPedido() != null) {
            this.pedido = new HashMap<>();
            this.pedido.put("id", detalle.getPedido().getId());
            this.pedido.put("fechaPedido", detalle.getPedido().getFechaPedido().toString());
            this.pedido.put("estado", detalle.getPedido().getEstado().toString());
            this.pedido.put("compradorNombre", detalle.getPedido().getComprador().getNombre() + " " + 
                    detalle.getPedido().getComprador().getApellido());
        }
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public String getProductoNombre() {
        return productoNombre;
    }

    public void setProductoNombre(String productoNombre) {
        this.productoNombre = productoNombre;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(Double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Map<String, Object> getProducto() {
        return producto;
    }

    public void setProducto(Map<String, Object> producto) {
        this.producto = producto;
    }

    public Map<String, Object> getPedido() {
        return pedido;
    }

    public void setPedido(Map<String, Object> pedido) {
        this.pedido = pedido;
    }
}
