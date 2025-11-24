package com.ecomerce.dto;

import com.ecomerce.model.Producto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer stock;
    private LocalDate fechaCosecha;
    private Boolean activo;
    private LocalDateTime fechaPublicacion;
    private String imagenUrl;
    
    // Información de la categoría
    private Long categoriaId;
    private String categoriaNombre;
    
    // Información de la subcategoría
    private Long subcategoriaId;
    private String subcategoriaNombre;
    
    // Información del usuario
    private String usuarioDocumento;
    private String usuarioNombre;

    public ProductoDTO(Producto producto) {
        this.id = producto.getId();
        this.nombre = producto.getNombre();
        this.descripcion = producto.getDescripcion();
        this.precio = producto.getPrecio();
        this.stock = producto.getStock();
        this.fechaCosecha = producto.getFechaCosecha();
        this.activo = producto.getActivo();
        this.fechaPublicacion = producto.getFechaPublicacion();
        this.imagenUrl = producto.getImagenUrl();
        
        if (producto.getCategoria() != null) {
            this.categoriaId = producto.getCategoria().getId();
            this.categoriaNombre = producto.getCategoria().getNombre();
        }
        
        if (producto.getSubcategoria() != null) {
            this.subcategoriaId = producto.getSubcategoria().getId();
            this.subcategoriaNombre = producto.getSubcategoria().getNombre();
        }
        
        if (producto.getUsuario() != null) {
            this.usuarioDocumento = producto.getUsuario().getNumeroDocumento();
            this.usuarioNombre = producto.getUsuario().getNombre() + " " + producto.getUsuario().getApellido();
        }
    }
}
