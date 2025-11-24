package com.ecomerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String numeroDocumento;
    private String correo;
    private String rol;
    private String nombre;
    private String apellido;

    public JwtResponse(String token, String numeroDocumento, String correo, String rol, String nombre, String apellido) {
        this.token = token;
        this.numeroDocumento = numeroDocumento;
        this.correo = correo;
        this.rol = rol;
        this.nombre = nombre;
        this.apellido = apellido;
    }
}
