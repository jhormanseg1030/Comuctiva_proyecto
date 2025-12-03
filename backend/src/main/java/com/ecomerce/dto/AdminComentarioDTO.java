package com.ecomerce.dto;

public class AdminComentarioDTO {
    private ComentarioDTO comentario;
    private Boolean activo;
    private String productoImagenUrl;

    public AdminComentarioDTO() {}

    public AdminComentarioDTO(ComentarioDTO comentario, Boolean activo, String productoImagenUrl) {
        this.comentario = comentario;
        this.activo = activo;
        this.productoImagenUrl = productoImagenUrl;
    }

    public ComentarioDTO getComentario() { return comentario; }
    public void setComentario(ComentarioDTO comentario) { this.comentario = comentario; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public String getProductoImagenUrl() { return productoImagenUrl; }
    public void setProductoImagenUrl(String productoImagenUrl) { this.productoImagenUrl = productoImagenUrl; }
}
