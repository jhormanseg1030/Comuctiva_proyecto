package com.ecomerce.service;

import com.ecomerce.model.Categoria;
import com.ecomerce.model.Producto;
import com.ecomerce.model.Subcategoria;
import com.ecomerce.model.Usuario;
import com.ecomerce.model.Comentario;
import com.ecomerce.model.Promocion;
import com.ecomerce.model.Carrito;
import com.ecomerce.model.DetallePedido;
import com.ecomerce.model.Pedido;
import com.ecomerce.model.Compra;
import com.ecomerce.model.Venta;
import com.ecomerce.repository.CategoriaRepository;
import com.ecomerce.repository.ProductoRepository;
import com.ecomerce.repository.SubcategoriaRepository;
import com.ecomerce.repository.UsuarioRepository;
import com.ecomerce.repository.ComentarioRepository;
import com.ecomerce.repository.PromocionRepository;
import com.ecomerce.repository.CarritoRepository;
import com.ecomerce.repository.DetallePedidoRepository;
import com.ecomerce.repository.CompraRepository;
import com.ecomerce.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private SubcategoriaRepository subcategoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ComentarioRepository comentarioRepository;

    @Autowired
    private PromocionRepository promocionRepository;

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public Producto crearProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    public Optional<Producto> obtenerProductoPorId(Long id) {
        return productoRepository.findById(id);
    }

    public List<Producto> obtenerTodosProductos() {
        return productoRepository.findAll();
    }

    public List<Producto> obtenerProductosActivos() {
        return productoRepository.findByActivo(true);
    }

    public List<Producto> obtenerProductosPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaId(categoriaId);
    }

    public List<Producto> obtenerProductosPorSubcategoria(Long subcategoriaId) {
        return productoRepository.findBySubcategoriaId(subcategoriaId);
    }

    public List<Producto> obtenerProductosPorUsuario(String numeroDocumento) {
        return productoRepository.findByUsuarioNumeroDocumento(numeroDocumento);
    }

    // Buscar productos por palabra clave en nombre o descripción
    public List<Producto> buscarProductos(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return productoRepository.findAll();
        }
        String q = keyword.trim();
        return productoRepository.findByNombreContainingIgnoreCaseOrDescripcionContainingIgnoreCase(q, q);
    }

    public Producto actualizarProducto(Long id, Producto productoActualizado) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setNombre(productoActualizado.getNombre());
        producto.setDescripcion(productoActualizado.getDescripcion());
        producto.setPrecio(productoActualizado.getPrecio());
        producto.setStock(productoActualizado.getStock());
        producto.setFechaCosecha(productoActualizado.getFechaCosecha());
        producto.setImagenUrl(productoActualizado.getImagenUrl());

        if (productoActualizado.getCategoria() != null) {
            Categoria categoria = categoriaRepository.findById(productoActualizado.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(categoria);
        }

        if (productoActualizado.getSubcategoria() != null) {
            Subcategoria subcategoria = subcategoriaRepository.findById(productoActualizado.getSubcategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));
            producto.setSubcategoria(subcategoria);
        }

        return productoRepository.save(producto);
    }

    public Producto cambiarEstado(Long id, Boolean activo) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setActivo(activo);
        return productoRepository.save(producto);
    }

    public void eliminarProducto(Long id, boolean force) {
        Producto producto = productoRepository.findById(id).orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Si no es force: mantener comportamiento conservador y rechazar si existen registros históricos
        List<DetallePedido> detalles = detallePedidoRepository.findByProductoId(id);
        List<DetallePedido> detallesActivos = detallePedidoRepository.findByProductoIdWherePedidoNotCancel(id, Pedido.EstadoPedido.CANCELADO);
        List<Compra> compras = compraRepository.findByProductoId(id);
        List<Venta> ventas = ventaRepository.findByProductoId(id);

        if (!force) {
            // Si existen detalles asociados a pedidos que NO están cancelados, bloquear la eliminación
            if (detallesActivos != null && !detallesActivos.isEmpty()) {
                throw new RuntimeException("No se puede eliminar el producto: existen detalles de pedido asociados a pedidos activos. Desactívelo en su lugar.");
            }

            // Si existen compras/ventas históricas, conservar comportamiento conservador
            if (compras != null && !compras.isEmpty()) {
                throw new RuntimeException("No se puede eliminar el producto: existen compras asociadas. Desactívelo en su lugar.");
            }
            if (ventas != null && !ventas.isEmpty()) {
                throw new RuntimeException("No se puede eliminar el producto: existen ventas asociadas. Desactívelo en su lugar.");
            }

            // En este punto: no hay detalles en pedidos activos, pero puede haber detalles en pedidos CANCELADOS.
            // Eliminamos esos detalles cancelados para poder borrar el producto sin romper integridad referencial.
            if (detalles != null && !detalles.isEmpty()) {
                detallePedidoRepository.deleteAll(detalles);
            }
        } else {
            // Force delete: eliminar dependencias en orden seguro
            if (detalles != null && !detalles.isEmpty()) {
                detallePedidoRepository.deleteAll(detalles);
            }
            if (ventas != null && !ventas.isEmpty()) {
                ventaRepository.deleteAll(ventas);
            }
            if (compras != null && !compras.isEmpty()) {
                compraRepository.deleteAll(compras);
            }
        }

        // Eliminar referencias no críticas: carrito, comentarios, promociones
        List<Carrito> carritos = carritoRepository.findByProductoId(id);
        if (carritos != null && !carritos.isEmpty()) {
            carritoRepository.deleteAll(carritos);
        }

        List<Comentario> comentarios = comentarioRepository.findByProductoId(id);
        if (comentarios != null && !comentarios.isEmpty()) {
            comentarioRepository.deleteAll(comentarios);
        }

        List<Promocion> promos = promocionRepository.findByProductoId(id);
        if (promos != null && !promos.isEmpty()) {
            promocionRepository.deleteAll(promos);
        }

        // Eliminar fichero de imagen asociado si existe
        if (producto.getImagenUrl() != null && !producto.getImagenUrl().isEmpty()) {
            String oldFileName = producto.getImagenUrl().substring(producto.getImagenUrl().lastIndexOf('/') + 1);
            try {
                fileStorageService.deleteFile(oldFileName);
            } catch (Exception e) {
                // Log y continuar con borrado de la entidad
                System.err.println("Aviso: no se pudo eliminar fichero de imagen: " + e.getMessage());
            }
        }

        productoRepository.delete(producto);
    }

    public Producto actualizarStock(Long id, Integer cantidad) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setStock(producto.getStock() + cantidad);
        return productoRepository.save(producto);
    }

    // Soft-delete (archive) the product image metadata (does not delete the file)
    public Producto archiveImagenProducto(Long id, String adminDocumento) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getImagenUrl() == null || producto.getImagenUrl().isEmpty()) {
            throw new RuntimeException("El producto no tiene imagen para archivar");
        }

        producto.setImagenDeleted(true);
        producto.setImagenDeletedAt(LocalDateTime.now());
        producto.setImagenDeletedBy(adminDocumento);

        return productoRepository.save(producto);
    }

    public Producto restoreImagenProducto(Long id, String adminDocumento) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!Boolean.TRUE.equals(producto.getImagenDeleted())) {
            throw new RuntimeException("La imagen no está archivada");
        }

        producto.setImagenDeleted(false);
        producto.setImagenDeletedAt(null);
        producto.setImagenDeletedBy(null);

        return productoRepository.save(producto);
    }
}
