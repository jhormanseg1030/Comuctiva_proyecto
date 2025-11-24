package com.ecomerce.service;

import com.ecomerce.model.Carrito;
import com.ecomerce.model.Producto;
import com.ecomerce.model.Usuario;
import com.ecomerce.repository.CarritoRepository;
import com.ecomerce.repository.ProductoRepository;
import com.ecomerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CarritoService {

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Obtener carrito de un usuario
    @Transactional(readOnly = true)
    public List<Carrito> obtenerCarritoPorUsuario(String numeroDocumento) {
        return carritoRepository.findByUsuarioNumeroDocumentoWithProducto(numeroDocumento);
    }

    // Agregar producto al carrito
    public Carrito agregarAlCarrito(String numeroDocumento, Long productoId, Integer cantidad) {
        // Validar usuario
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar producto
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!producto.getActivo()) {
            throw new RuntimeException("El producto no está disponible");
        }

        if (producto.getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStock());
        }

        // Verificar si el producto ya está en el carrito
        Optional<Carrito> carritoExistente = carritoRepository
                .findByUsuarioAndProducto(usuario, producto);

        Carrito carrito;
        if (carritoExistente.isPresent()) {
            // Actualizar cantidad
            carrito = carritoExistente.get();
            int nuevaCantidad = carrito.getCantidad() + cantidad;
            
            if (producto.getStock() < nuevaCantidad) {
                throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStock());
            }
            
            carrito.setCantidad(nuevaCantidad);
        } else {
            // Crear nuevo item en carrito
            carrito = new Carrito();
            carrito.setUsuario(usuario);
            carrito.setProducto(producto);
            carrito.setCantidad(cantidad);
            carrito.setPrecioUnitario(producto.getPrecio());
        }

        return carritoRepository.save(carrito);
    }

    // Actualizar cantidad de un item del carrito
    public Carrito actualizarCantidad(Long carritoId, Integer nuevaCantidad) {
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new RuntimeException("Item del carrito no encontrado"));

        if (nuevaCantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        Producto producto = carrito.getProducto();
        if (producto.getStock() < nuevaCantidad) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStock());
        }

        carrito.setCantidad(nuevaCantidad);
        return carritoRepository.save(carrito);
    }

    // Eliminar item del carrito
    public void eliminarDelCarrito(Long carritoId) {
        if (!carritoRepository.existsById(carritoId)) {
            throw new RuntimeException("Item del carrito no encontrado");
        }
        carritoRepository.deleteById(carritoId);
    }

    // Vaciar carrito completo de un usuario
    public void vaciarCarrito(String numeroDocumento) {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        carritoRepository.deleteByUsuario(usuario);
    }

    // Calcular total del carrito
    @Transactional(readOnly = true)
    public Double calcularTotalCarrito(String numeroDocumento) {
        List<Carrito> items = carritoRepository.findByUsuarioNumeroDocumento(numeroDocumento);
        
        return items.stream()
                .mapToDouble(item -> item.getProducto().getPrecio().doubleValue() * item.getCantidad())
                .sum();
    }
}
