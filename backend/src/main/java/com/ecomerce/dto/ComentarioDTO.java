package com.ecomerce.dto;

import com.ecomerce.model.Comentario;
import java.time.LocalDateTime;

public class ComentarioDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String usuarioDocumento;
    private String usuarioNombre;
    private String comentario;
    private Integer calificacion;
    private LocalDateTime fecha;

    public ComentarioDTO() {
    }

    public ComentarioDTO(Comentario comentario) {
        this.id = comentario.getId();
        this.productoId = comentario.getProducto().getId();
        this.productoNombre = comentario.getProducto().getNombre();
        this.usuarioDocumento = comentario.getUsuario().getNumeroDocumento();
        this.usuarioNombre = comentario.getUsuario().getNombre() + " " + comentario.getUsuario().getApellido();
        this.comentario = comentario.getContenido();
        this.calificacion = comentario.getCalificacion();
        this.fecha = comentario.getFechaComentario();
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

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public Integer getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Integer calificacion) {
        this.calificacion = calificacion;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
