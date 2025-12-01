package com.ecomerce.backup;

import com.ecomerce.model.*;
import com.ecomerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
// Backup service annotations removed to avoid duplicate bean registration

import java.time.LocalDateTime;
import java.util.List;

class PedidoService {

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
    // @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorUsuario(String numeroDocumento) {
        return pedidoRepository.findByCompradorNumeroDocumento(numeroDocumento);
    }

    // Obtener todos los pedidos (ADMIN)
    // @Transactional(readOnly = true)
    public List<Pedido> obtenerTodosPedidos() {
        return pedidoRepository.findAll();
    }

    // Obtener pedido por ID
    // @Transactional(readOnly = true)
    public Pedido obtenerPedidoPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    // Obtener detalles de un pedido
    // @Transactional(readOnly = true)
    public List<DetallePedido> obtenerDetallesPedido(Long pedidoId) {
        return detallePedidoRepository.findByPedidoId(pedidoId);
    }

    // Obtener ventas de un vendedor
    // @Transactional(readOnly = true)
    public List<DetallePedido> obtenerVentasPorVendedor(String numeroDocumento) {
        return detallePedidoRepository.findByVendedorNumeroDocumento(numeroDocumento);
    }

    // Actualizar estado del pedido
    public Pedido actualizarEstadoPedido(Long pedidoId, String nuevoEstado) {
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
        return pedidoRepository.save(pedido);
    }

    // Cancelar pedido
    public Pedido cancelarPedido(Long pedidoId, String numeroDocumento) {
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
        return pedidoRepository.save(pedido);
    }
}
