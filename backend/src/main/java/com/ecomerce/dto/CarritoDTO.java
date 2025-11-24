package com.ecomerce.dto;

import com.ecomerce.model.Carrito;

public class CarritoDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String productoDescripcion;
    private Double productoPrecio;
    private String productoImagenUrl;
    private Integer cantidad;
    private Double subtotal;
    private Integer stockDisponible;
    private String usuarioDocumento;

    public CarritoDTO() {
    }

    public CarritoDTO(Carrito carrito) {
        this.id = carrito.getId();
        // Usar precioUnitario del carrito en lugar del precio actual del producto
        this.productoPrecio = carrito.getPrecioUnitario() != null ? 
            carrito.getPrecioUnitario().doubleValue() : 
            carrito.getProducto().getPrecio().doubleValue();
        this.cantidad = carrito.getCantidad();
        this.subtotal = this.productoPrecio * this.cantidad;
        
        // Datos del producto
        this.productoId = carrito.getProducto().getId();
        this.productoNombre = carrito.getProducto().getNombre();
        this.productoDescripcion = carrito.getProducto().getDescripcion();
        this.productoImagenUrl = carrito.getProducto().getImagenUrl();
        this.stockDisponible = carrito.getProducto().getStock();
        
        // Datos del usuario
        this.usuarioDocumento = carrito.getUsuario().getNumeroDocumento();
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

    public String getProductoDescripcion() {
        return productoDescripcion;
    }

    public void setProductoDescripcion(String productoDescripcion) {
        this.productoDescripcion = productoDescripcion;
    }

    public Double getProductoPrecio() {
        return productoPrecio;
    }

    public void setProductoPrecio(Double productoPrecio) {
        this.productoPrecio = productoPrecio;
    }

    public String getProductoImagenUrl() {
        return productoImagenUrl;
    }

    public void setProductoImagenUrl(String productoImagenUrl) {
        this.productoImagenUrl = productoImagenUrl;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Integer getStockDisponible() {
        return stockDisponible;
    }

    public void setStockDisponible(Integer stockDisponible) {
        this.stockDisponible = stockDisponible;
    }

    public String getUsuarioDocumento() {
        return usuarioDocumento;
    }

    public void setUsuarioDocumento(String usuarioDocumento) {
        this.usuarioDocumento = usuarioDocumento;
    }
}
