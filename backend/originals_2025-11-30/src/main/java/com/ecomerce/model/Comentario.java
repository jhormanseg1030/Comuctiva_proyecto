package com.ecomerce.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "comentarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_documento", nullable = false)
    private Usuario usuario;

    @NotBlank
    @Column(nullable = false, length = 1000)
    private String contenido;

    @Column(nullable = false)
    private Integer calificacion;

    @Column(name = "fecha_comentario", nullable = false)
    private LocalDateTime fechaComentario = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean activo = true;

    // Explicit getters/setters (in case Lombok processing is not running)
    public Long getId() { return this.id; }
    public Producto getProducto() { return this.producto; }
    public void setProducto(Producto p) { this.producto = p; }
    public Usuario getUsuario() { return this.usuario; }
    public void setUsuario(Usuario u) { this.usuario = u; }
    public String getContenido() { return this.contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    public Integer getCalificacion() { return this.calificacion; }
    public void setCalificacion(Integer calificacion) { this.calificacion = calificacion; }
    public java.time.LocalDateTime getFechaComentario() { return this.fechaComentario; }
    public void setFechaComentario(java.time.LocalDateTime fechaComentario) { this.fechaComentario = fechaComentario; }
    public Boolean getActivo() { return this.activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
