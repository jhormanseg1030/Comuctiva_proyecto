package com.ecomerce.dto;

import com.ecomerce.model.Comentario;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class ComentarioDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String usuarioDocumento;
    private String usuarioNombre;
    private String comentario;
    private Integer calificacion;
    private LocalDateTime fecha;
    // Campos adicionales para compatibilidad con frontend
    private String contenido;
    private LocalDateTime fechaComentario;
    private Map<String, String> usuario;

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
        // Compatibilidad: exponer los mismos campos que antes esperaba el frontend
        this.contenido = comentario.getContenido();
        this.fechaComentario = comentario.getFechaComentario();
        this.usuario = new HashMap<>();
        if (comentario.getUsuario() != null) {
            this.usuario.put("nombre", comentario.getUsuario().getNombre());
            this.usuario.put("numeroDocumento", comentario.getUsuario().getNumeroDocumento());
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

    // Compatibilidad getters/setters
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaComentario() { return fechaComentario; }
    public void setFechaComentario(LocalDateTime fechaComentario) { this.fechaComentario = fechaComentario; }

    public Map<String, String> getUsuario() { return usuario; }
    public void setUsuario(Map<String, String> usuario) { this.usuario = usuario; }
}
