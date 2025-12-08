package com.ecomerce.service;

import com.ecomerce.model.*;
import com.ecomerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.ecomerce.dto.PedidoDTO;
import com.ecomerce.dto.DetallePedidoDTO;

@Service
@Transactional
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear pedido desde el carrito
    public Pedido crearPedidoDesdeCarrito(String numeroDocumento, String direccionEnvio, String metodoPago, Double costoFlete) {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Obtener items del carrito
        List<Carrito> itemsCarrito = carritoRepository.findByUsuarioNumeroDocumento(numeroDocumento);
        
        if (itemsCarrito.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // Validar stock de todos los productos
        for (Carrito item : itemsCarrito) {
            Producto producto = item.getProducto();
            if (!producto.getActivo()) {
                throw new RuntimeException("El producto " + producto.getNombre() + " ya no está disponible");
            }
            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para " + producto.getNombre() + 
                        ". Disponible: " + producto.getStock());
            }
        }

        // Calcular subtotal
        double subtotal = itemsCarrito.stream()
                .mapToDouble(item -> item.getProducto().getPrecio().doubleValue() * item.getCantidad())
                .sum();

        // Calcular total con flete
        double fleteValue = costoFlete != null ? costoFlete : 0.0;
        double total = subtotal + fleteValue;

        // Crear pedido
        Pedido pedido = new Pedido();
        pedido.setComprador(usuario);
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setEstado(Pedido.EstadoPedido.PENDIENTE);
        pedido.setTotal(new java.math.BigDecimal(total));
        pedido.setCostoFlete(new java.math.BigDecimal(fleteValue));
        pedido.setDireccionEntrega(direccionEnvio != null ? direccionEnvio : usuario.getDireccion());
        pedido.setMetodoPago(metodoPago != null ? metodoPago : "EFECTIVO");
        
        pedido = pedidoRepository.save(pedido);

        // Crear detalles del pedido y actualizar stock
        for (Carrito item : itemsCarrito) {
            Producto producto = item.getProducto();

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(producto.getPrecio().multiply(new java.math.BigDecimal(item.getCantidad())));
            // Asignar el vendedor del producto
            detalle.setVendedor(producto.getUsuario());

            detallePedidoRepository.save(detalle);

            // Actualizar stock
            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);
        }

        // Vaciar carrito
        carritoRepository.deleteByUsuario(usuario);

        return pedido;
    }

    // Obtener pedidos de un usuario
    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorUsuario(String numeroDocumento) {
        return pedidoRepository.findByCompradorNumeroDocumento(numeroDocumento);
    }

    @Transactional(readOnly = true)
    public List<PedidoDTO> obtenerPedidosPorUsuarioDTO(String numeroDocumento) {
        List<Pedido> pedidos = pedidoRepository.findByCompradorNumeroDocumento(numeroDocumento);
        return pedidos.stream()
                .map(PedidoDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DetallePedidoDTO> obtenerVentasPorVendedorDTO(String numeroDocumento) {
        List<DetallePedido> ventas = detallePedidoRepository.findByVendedorNumeroDocumento(numeroDocumento);
        return ventas.stream()
                .map(DetallePedidoDTO::new)
                .collect(Collectors.toList());
    }

    // Obtener todos los pedidos (ADMIN)
    @Transactional(readOnly = true)
    public List<Pedido> obtenerTodosPedidos() {
        return pedidoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<PedidoDTO> obtenerTodosPedidosDTO() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        return pedidos.stream()
                .map(PedidoDTO::new)
                .collect(Collectors.toList());
    }

    // Obtener pedido por ID
    @Transactional(readOnly = true)
    public Pedido obtenerPedidoPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    @Transactional(readOnly = true)
    public PedidoDTO obtenerPedidoDTOPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        return new PedidoDTO(pedido);
    }

    // Obtener detalles de un pedido
    @Transactional(readOnly = true)
    public List<DetallePedido> obtenerDetallesPedido(Long pedidoId) {
        return detallePedidoRepository.findByPedidoId(pedidoId);
    }

    @Transactional(readOnly = true)
    public List<DetallePedidoDTO> obtenerDetallesPedidoDTO(Long pedidoId) {
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoId(pedidoId);
        return detalles.stream()
                .map(DetallePedidoDTO::new)
                .collect(Collectors.toList());
    }

    // Obtener ventas de un vendedor
    @Transactional(readOnly = true)
    public List<DetallePedido> obtenerVentasPorVendedor(String numeroDocumento) {
        return detallePedidoRepository.findByVendedorNumeroDocumento(numeroDocumento);
    }

    // Actualizar estado del pedido (devuelve DTO construido dentro de la transacción)
    public PedidoDTO actualizarEstadoPedido(Long pedidoId, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Validar y convertir estado
        Pedido.EstadoPedido estadoPedido;
        try {
            estadoPedido = Pedido.EstadoPedido.valueOf(nuevoEstado);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado no válido. Estados permitidos: PENDIENTE, CONFIRMADO, EN_CAMINO, ENTREGADO, CANCELADO");
        }

        pedido.setEstado(estadoPedido);
        Pedido saved = pedidoRepository.save(pedido);

        // Construir y devolver DTO mientras la sesión/transaction está activa
        return new PedidoDTO(saved);
    }

    // Cancelar pedido - devuelve DTO (construido dentro de la transacción)
    public com.ecomerce.dto.PedidoDTO cancelarPedido(Long pedidoId, String numeroDocumento) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Verificar que el pedido pertenece al usuario
        if (!pedido.getComprador().getNumeroDocumento().equals(numeroDocumento)) {
            throw new RuntimeException("No tienes permiso para cancelar este pedido");
        }

        // Solo se puede cancelar si está pendiente o confirmado
        if (pedido.getEstado() != Pedido.EstadoPedido.PENDIENTE && 
            pedido.getEstado() != Pedido.EstadoPedido.CONFIRMADO) {
            throw new RuntimeException("No se puede cancelar un pedido en estado " + pedido.getEstado());
        }

        // Restaurar stock
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoId(pedidoId);
        for (DetallePedido detalle : detalles) {
            Producto producto = detalle.getProducto();
            producto.setStock(producto.getStock() + detalle.getCantidad());
            productoRepository.save(producto);
        }

        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        Pedido saved = pedidoRepository.save(pedido);

        // Construir DTO mientras la sesión/transaction está activa para evitar LazyInitializationException
        return new com.ecomerce.dto.PedidoDTO(saved);
    }
}
