package com.ecomerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoriaRequest {
    @NotBlank
    private String nombre;
    private String descripcion;
    @NotNull
    private Long categoriaId;
    private Boolean activo;
}
