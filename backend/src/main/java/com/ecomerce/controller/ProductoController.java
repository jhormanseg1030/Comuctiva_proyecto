package com.ecomerce.controller;

import com.ecomerce.dto.MessageResponse;
import com.ecomerce.dto.ProductoDTO;
import com.ecomerce.model.Producto;
import com.ecomerce.service.FileStorageService;
import com.ecomerce.service.ProductoService;
import com.ecomerce.service.ComentarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/productos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ComentarioService comentarioService;

    private String getBaseUrl() {
        return "http://localhost:8080/api/files/productos/";
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductoDTO>> obtenerTodosProductos() {
        List<ProductoDTO> productos = productoService.obtenerTodosProductos()
                .stream()
                .map(ProductoDTO::new)
                .collect(Collectors.toList());
        // completar calificaciones y conteo de comentarios
        productos.forEach(p -> {
            Double prom = comentarioService.calcularPromedioCalificacion(p.getId());
            int total = comentarioService.contarComentariosPorProducto(p.getId());
            p.setCalificacionPromedio(prom);
            p.setTotalComentarios(total);
        });
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/activos")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductoDTO>> obtenerProductosActivos() {
        List<ProductoDTO> productos = productoService.obtenerProductosActivos()
                .stream()
                .map(ProductoDTO::new)
                .collect(Collectors.toList());
        productos.forEach(p -> {
            Double prom = comentarioService.calcularPromedioCalificacion(p.getId());
            int total = comentarioService.contarComentariosPorProducto(p.getId());
            p.setCalificacionPromedio(prom);
            p.setTotalComentarios(total);
        });
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerProducto(@PathVariable Long id) {
        return productoService.obtenerProductoPorId(id)
                .map(producto -> ResponseEntity.ok(new ProductoDTO(producto)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categoria/{categoriaId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductoDTO>> obtenerProductosPorCategoria(@PathVariable Long categoriaId) {
        List<ProductoDTO> productos = productoService.obtenerProductosPorCategoria(categoriaId)
                .stream()
                .map(ProductoDTO::new)
                .collect(Collectors.toList());
        productos.forEach(p -> {
            Double prom = comentarioService.calcularPromedioCalificacion(p.getId());
            int total = comentarioService.contarComentariosPorProducto(p.getId());
            p.setCalificacionPromedio(prom);
            p.setTotalComentarios(total);
        });
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/subcategoria/{subcategoriaId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductoDTO>> obtenerProductosPorSubcategoria(@PathVariable Long subcategoriaId) {
        List<ProductoDTO> productos = productoService.obtenerProductosPorSubcategoria(subcategoriaId)
                .stream()
                .map(ProductoDTO::new)
                .collect(Collectors.toList());
        productos.forEach(p -> {
            Double prom = comentarioService.calcularPromedioCalificacion(p.getId());
            int total = comentarioService.contarComentariosPorProducto(p.getId());
            p.setCalificacionPromedio(prom);
            p.setTotalComentarios(total);
        });
        return ResponseEntity.ok(productos);
    }

    // Buscar productos por palabra clave (nombre o descripción)
    @GetMapping("/buscar")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductoDTO>> buscarProductos(@RequestParam(required = false) String keyword) {
        List<ProductoDTO> productos = productoService.buscarProductos(keyword)
                .stream()
                .map(ProductoDTO::new)
                .collect(Collectors.toList());
        productos.forEach(p -> {
            Double prom = comentarioService.calcularPromedioCalificacion(p.getId());
            int total = comentarioService.contarComentariosPorProducto(p.getId());
            p.setCalificacionPromedio(prom);
            p.setTotalComentarios(total);
        });
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/usuario/{numeroDocumento}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductoDTO>> obtenerProductosPorUsuario(@PathVariable String numeroDocumento) {
        List<ProductoDTO> productos = productoService.obtenerProductosPorUsuario(numeroDocumento)
                .stream()
                .map(ProductoDTO::new)
                .collect(Collectors.toList());
        productos.forEach(p -> {
            Double prom = comentarioService.calcularPromedioCalificacion(p.getId());
            int total = comentarioService.contarComentariosPorProducto(p.getId());
            p.setCalificacionPromedio(prom);
            p.setTotalComentarios(total);
        });
        return ResponseEntity.ok(productos);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> crearProducto(@Valid @RequestBody Producto producto) {
        Producto nuevoProducto = productoService.crearProducto(producto);
        return ResponseEntity.ok(nuevoProducto);
    }

    @PostMapping(value = "/con-imagen", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> crearProductoConImagen(
            @RequestParam("nombre") String nombre,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("precio") String precio,
            @RequestParam("stock") String stock,
            @RequestParam(value = "fechaCosecha", required = false) String fechaCosecha,
            @RequestParam("categoriaId") String categoriaId,
            @RequestParam("subcategoriaId") String subcategoriaId,
            @RequestParam("usuarioDocumento") String usuarioDocumento,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        try {
            Producto producto = new Producto();
            producto.setNombre(nombre);
            producto.setDescripcion(descripcion);
            producto.setPrecio(new java.math.BigDecimal(precio));
            producto.setStock(Integer.parseInt(stock));
            
            if (fechaCosecha != null && !fechaCosecha.isEmpty()) {
                producto.setFechaCosecha(java.time.LocalDate.parse(fechaCosecha));
            }

            // Establecer relaciones
            com.ecomerce.model.Categoria categoria = new com.ecomerce.model.Categoria();
            categoria.setId(Long.parseLong(categoriaId));
            producto.setCategoria(categoria);

            com.ecomerce.model.Subcategoria subcategoria = new com.ecomerce.model.Subcategoria();
            subcategoria.setId(Long.parseLong(subcategoriaId));
            producto.setSubcategoria(subcategoria);

            com.ecomerce.model.Usuario usuario = new com.ecomerce.model.Usuario();
            usuario.setNumeroDocumento(usuarioDocumento);
            producto.setUsuario(usuario);

            // Guardar imagen si existe
            if (imagen != null && !imagen.isEmpty()) {
                String fileName = fileStorageService.storeFile(imagen);
                producto.setImagenUrl(getBaseUrl() + fileName);
            }

            Producto nuevoProducto = productoService.crearProducto(producto);
            return ResponseEntity.ok(nuevoProducto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @Valid @RequestBody Producto producto) {
        try {
            Producto productoActualizado = productoService.actualizarProducto(id, producto);
            return ResponseEntity.ok(productoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}/con-imagen", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> actualizarProductoConImagen(
            @PathVariable Long id,
            @RequestParam(value = "nombre", required = false) String nombre,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "precio", required = false) String precio,
            @RequestParam(value = "stock", required = false) String stock,
            @RequestParam(value = "fechaCosecha", required = false) String fechaCosecha,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        try {
            Producto productoExistente = productoService.obtenerProductoPorId(id)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (nombre != null) productoExistente.setNombre(nombre);
            if (descripcion != null) productoExistente.setDescripcion(descripcion);
            if (precio != null) productoExistente.setPrecio(new java.math.BigDecimal(precio));
            if (stock != null) productoExistente.setStock(Integer.parseInt(stock));
            if (fechaCosecha != null && !fechaCosecha.isEmpty()) {
                productoExistente.setFechaCosecha(java.time.LocalDate.parse(fechaCosecha));
            }

            // Si hay nueva imagen, eliminar la anterior y guardar la nueva
            if (imagen != null && !imagen.isEmpty()) {
                // Eliminar imagen anterior si existe
                if (productoExistente.getImagenUrl() != null && !productoExistente.getImagenUrl().isEmpty()) {
                    String oldFileName = productoExistente.getImagenUrl().substring(
                            productoExistente.getImagenUrl().lastIndexOf("/") + 1);
                    fileStorageService.deleteFile(oldFileName);
                }
                
                // Guardar nueva imagen
                String fileName = fileStorageService.storeFile(imagen);
                productoExistente.setImagenUrl(getBaseUrl() + fileName);
            }

            Producto productoActualizado = productoService.actualizarProducto(id, productoExistente);
            return ResponseEntity.ok(productoActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/imagen")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> eliminarImagenProducto(@PathVariable Long id) {
        try {
            Producto producto = productoService.obtenerProductoPorId(id)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (producto.getImagenUrl() != null && !producto.getImagenUrl().isEmpty()) {
                String fileName = producto.getImagenUrl().substring(
                        producto.getImagenUrl().lastIndexOf("/") + 1);
                fileStorageService.deleteFile(fileName);
                producto.setImagenUrl(null);
                productoService.actualizarProducto(id, producto);
            }

            return ResponseEntity.ok(new MessageResponse("Imagen eliminada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam Boolean activo) {
        try {
            Producto producto = productoService.cambiarEstado(id, activo);
            return ResponseEntity.ok(producto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> actualizarStock(@PathVariable Long id, @RequestParam Integer cantidad) {
        try {
            Producto producto = productoService.actualizarStock(id, cantidad);
            return ResponseEntity.ok(producto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.ok(new MessageResponse("Producto eliminado exitosamente"));
    }
}
