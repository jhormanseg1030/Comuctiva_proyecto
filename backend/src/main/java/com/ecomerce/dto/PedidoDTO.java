package com.ecomerce.dto;

import com.ecomerce.model.Pedido;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PedidoDTO {
    private Long id;
    private String usuarioDocumento;
    private String usuarioNombre;
    private LocalDateTime fechaPedido;
    private String estadoPedido;
    private Double total;
    private String direccionEntrega;
    private String metodoPago;
    private Boolean conFlete;
    private Double costoFlete;
    private List<DetallePedidoDTO> detalles;

    public PedidoDTO() {
    }

    public PedidoDTO(Pedido pedido) {
        this.id = pedido.getId();
        this.usuarioDocumento = pedido.getComprador().getNumeroDocumento();
        this.usuarioNombre = pedido.getComprador().getNombre() + " " + pedido.getComprador().getApellido();
        this.fechaPedido = pedido.getFechaPedido();
        this.estadoPedido = pedido.getEstado().name();
        this.total = pedido.getTotal().doubleValue();
        this.direccionEntrega = pedido.getDireccionEntrega();
        this.metodoPago = pedido.getMetodoPago();
        this.conFlete = pedido.getConFlete();
        this.costoFlete = pedido.getCostoFlete() != null ? pedido.getCostoFlete().doubleValue() : 0.0;
        
        // Cargar detalles si existen
        if (pedido.getDetalles() != null && !pedido.getDetalles().isEmpty()) {
            this.detalles = pedido.getDetalles().stream()
                    .map(DetallePedidoDTO::new)
                    .collect(Collectors.toList());
        }
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsuarioDocumento() {
        return usuarioDocumento;
    }

    public void setUsuarioDocumento(String usuarioDocumento) {
        this.usuarioDocumento = usuarioDocumento;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public LocalDateTime getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(LocalDateTime fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public String getEstadoPedido() {
        return estadoPedido;
    }

    public void setEstadoPedido(String estadoPedido) {
        this.estadoPedido = estadoPedido;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getDireccionEntrega() {
        return direccionEntrega;
    }

    public void setDireccionEntrega(String direccionEntrega) {
        this.direccionEntrega = direccionEntrega;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public Boolean getConFlete() {
        return conFlete;
    }

    public void setConFlete(Boolean conFlete) {
        this.conFlete = conFlete;
    }

    public Double getCostoFlete() {
        return costoFlete;
    }

    public void setCostoFlete(Double costoFlete) {
        this.costoFlete = costoFlete;
    }

    public List<DetallePedidoDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetallePedidoDTO> detalles) {
        this.detalles = detalles;
    }
}
