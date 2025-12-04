package com.ecomerce.service;

import com.ecomerce.dto.ComentarioDTO;
import com.ecomerce.model.Comentario;
import com.ecomerce.model.Producto;
import com.ecomerce.model.Usuario;
import com.ecomerce.repository.ComentarioRepository;
import com.ecomerce.repository.ProductoRepository;
import com.ecomerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ComentarioService {

    @Autowired
    private ComentarioRepository comentarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear comentario
    public Comentario crearComentario(Long productoId, String numeroDocumento, 
                                     String comentario, Integer calificacion) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar calificación
        if (calificacion < 1 || calificacion > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }

        // Verificar si el usuario ya comentó este producto
        if (comentarioRepository.existsByProductoAndUsuario(producto, usuario)) {
            throw new RuntimeException("Ya has comentado este producto");
        }

        Comentario nuevoComentario = new Comentario();
        nuevoComentario.setProducto(producto);
        nuevoComentario.setUsuario(usuario);
        nuevoComentario.setContenido(comentario);
        nuevoComentario.setCalificacion(calificacion);
        nuevoComentario.setFechaComentario(LocalDateTime.now());
        nuevoComentario.setActivo(true);

        return comentarioRepository.save(nuevoComentario);
    }

    // Obtener comentarios de un producto (devuelve DTOs para evitar LazyInitialization)
    @Transactional(readOnly = true)
    public List<ComentarioDTO> obtenerComentariosPorProducto(Long productoId) {
        List<Comentario> comentarios = comentarioRepository.findByProductoIdAndActivo(productoId, true);
        return comentarios.stream().map(ComentarioDTO::new).collect(java.util.stream.Collectors.toList());
    }

    // Obtener comentarios de un usuario
    @Transactional(readOnly = true)
    public List<ComentarioDTO> obtenerComentariosPorUsuario(String numeroDocumento) {
        List<Comentario> comentarios = comentarioRepository.findByUsuarioNumeroDocumento(numeroDocumento);
        return comentarios.stream().map(ComentarioDTO::new).collect(java.util.stream.Collectors.toList());
    }

    // Actualizar comentario
    public Comentario actualizarComentario(Long comentarioId, String numeroDocumento,
                                          String nuevoComentario, Integer nuevaCalificacion) {
        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        // Verificar que el comentario pertenece al usuario
        if (!comentario.getUsuario().getNumeroDocumento().equals(numeroDocumento)) {
            throw new RuntimeException("No tienes permiso para editar este comentario");
        }

        if (nuevoComentario != null) {
            comentario.setContenido(nuevoComentario);
        }

        if (nuevaCalificacion != null) {
            if (nuevaCalificacion < 1 || nuevaCalificacion > 5) {
                throw new RuntimeException("La calificación debe estar entre 1 y 5");
            }
            comentario.setCalificacion(nuevaCalificacion);
        }

        return comentarioRepository.save(comentario);
    }

    // Eliminar comentario (desactivar)
    public void eliminarComentario(Long comentarioId, String numeroDocumento) {
        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        // Verificar que el comentario pertenece al usuario
        if (!comentario.getUsuario().getNumeroDocumento().equals(numeroDocumento)) {
            throw new RuntimeException("No tienes permiso para eliminar este comentario");
        }

        comentario.setActivo(false);
        comentarioRepository.save(comentario);
    }

    // Calcular calificación promedio de un producto
    @Transactional(readOnly = true)
    public Double calcularPromedioCalificacion(Long productoId) {
        List<Comentario> comentarios = comentarioRepository.findByProductoIdAndActivo(productoId, true);
        
        if (comentarios.isEmpty()) {
            return 0.0;
        }

        double suma = comentarios.stream()
                .mapToInt(Comentario::getCalificacion)
                .sum();

        return suma / comentarios.size();
    }

    @Transactional(readOnly = true)
    public int contarComentariosPorProducto(Long productoId) {
        return comentarioRepository.countByProductoIdAndActivo(productoId, true);
    }
}