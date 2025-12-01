package com.ecomerce.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @NotNull
    @Column(nullable = false)
    private Integer stock;

    @Column(name = "fecha_cosecha")
    private LocalDate fechaCosecha;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_publicacion", nullable = false)
    private LocalDateTime fechaPublicacion = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategoria_id", nullable = false)
    private Subcategoria subcategoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_documento", nullable = false)
    private Usuario usuario;

    @Column(name = "imagen_url")
    private String imagenUrl;

    // Explicit getters (in case Lombok is not processed)
    public Long getId() { return this.id; }
    public String getNombre() { return this.nombre; }
    public String getDescripcion() { return this.descripcion; }
    public java.math.BigDecimal getPrecio() { return this.precio; }
    public Integer getStock() { return this.stock; }
    public java.time.LocalDate getFechaCosecha() { return this.fechaCosecha; }
    public Boolean getActivo() { return this.activo; }
    public java.time.LocalDateTime getFechaPublicacion() { return this.fechaPublicacion; }
    public Categoria getCategoria() { return this.categoria; }
    public Subcategoria getSubcategoria() { return this.subcategoria; }
    public Usuario getUsuario() { return this.usuario; }
    public String getImagenUrl() { return this.imagenUrl; }

    // Basic setters used by services
    public void setStock(Integer stock) { this.stock = stock; }
    public void setPrecio(java.math.BigDecimal precio) { this.precio = precio; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}
