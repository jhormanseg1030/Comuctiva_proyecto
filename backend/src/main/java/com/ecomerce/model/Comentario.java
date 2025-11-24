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
}
