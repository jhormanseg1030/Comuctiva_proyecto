package com.ecomerce.dto;

import com.ecomerce.model.Promocion;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PromocionDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String creadorDocumento;
    private BigDecimal porcentajeDescuento;
    private BigDecimal precioPromocion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaVencimiento;
    private Boolean activo;
    private LocalDateTime fechaCreacion;

    public PromocionDTO(Promocion p) {
        this.id = p.getId();
        if (p.getProducto() != null) {
            this.productoId = p.getProducto().getId();
            this.productoNombre = p.getProducto().getNombre();
        }
        if (p.getCreador() != null) {
            this.creadorDocumento = p.getCreador().getNumeroDocumento();
        }
        this.porcentajeDescuento = p.getPorcentajeDescuento();
        this.precioPromocion = p.getPrecioPromocion();
        this.fechaInicio = p.getFechaInicio();
        this.fechaVencimiento = p.getFechaVencimiento();
        this.activo = p.getActivo();
        this.fechaCreacion = p.getFechaCreacion();
    }
}
