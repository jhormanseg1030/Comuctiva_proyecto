package com.ecomerce.dto;

import com.ecomerce.model.Subcategoria;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoriaDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Long categoriaId;
    private String categoriaNombre;

    public SubcategoriaDTO(Subcategoria subcategoria) {
        this.id = subcategoria.getId();
        this.nombre = subcategoria.getNombre();
        this.descripcion = subcategoria.getDescripcion();
        if (subcategoria.getCategoria() != null) {
            this.categoriaId = subcategoria.getCategoria().getId();
            this.categoriaNombre = subcategoria.getCategoria().getNombre();
        }
    }
}
