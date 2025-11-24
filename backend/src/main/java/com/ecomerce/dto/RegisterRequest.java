package com.ecomerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    @NotBlank
    private String numeroDocumento;
    
    @NotBlank
    private String tipoDocumento;
    
    @NotBlank
    private String password;
    
    @NotBlank
    private String nombre;
    
    @NotBlank
    private String apellido;
    
    @NotBlank
    private String telefono;
    
    @NotBlank
    private String direccion;
    
    @NotBlank
    @Email
    private String correo;
    
    private String rol = "USER";
}
