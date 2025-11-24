package com.ecomerce.service;

import com.ecomerce.model.Producto;
import com.ecomerce.model.Promocion;
import com.ecomerce.model.Usuario;
import com.ecomerce.repository.ProductoRepository;
import com.ecomerce.repository.PromocionRepository;
import com.ecomerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PromocionService {

    @Autowired
    private PromocionRepository promocionRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Promocion crearPromocion(Promocion promocion, Long productoId, String creadorDocumento) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        Usuario creador = usuarioRepository.findById(creadorDocumento)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar que el creador de la promoción sea el dueño del producto
        if (!producto.getUsuario().getNumeroDocumento().equals(creadorDocumento)) {
            throw new RuntimeException("Solo puedes crear promociones para tus propios productos");
        }

        // Validar que el producto esté activo
        if (!producto.getActivo()) {
            throw new RuntimeException("No puedes crear promociones para productos inactivos");
        }

        // Calcular precio con descuento
        BigDecimal precioOriginal = producto.getPrecio();
        BigDecimal descuento = promocion.getPorcentajeDescuento().divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal precioPromocion = precioOriginal.subtract(precioOriginal.multiply(descuento));

        promocion.setProducto(producto);
        promocion.setCreador(creador);
        promocion.setPrecioPromocion(precioPromocion);
        promocion.setFechaCreacion(LocalDateTime.now());
        
        return promocionRepository.save(promocion);
    }

    public Optional<Promocion> obtenerPromocionPorId(Long id) {
        return promocionRepository.findById(id);
    }

    public List<Promocion> obtenerTodasPromociones() {
        return promocionRepository.findAll();
    }

    public List<Promocion> obtenerPromocionesVigentes() {
        return promocionRepository.findPromocionesVigentes(LocalDateTime.now());
    }

    public List<Promocion> obtenerPromocionesPorProducto(Long productoId) {
        return promocionRepository.findByProductoId(productoId);
    }

    public List<Promocion> obtenerPromocionesVigentesPorProducto(Long productoId) {
        return promocionRepository.findPromocionesVigentesByProducto(productoId, LocalDateTime.now());
    }

    public List<Promocion> obtenerPromocionesPorCreador(String numeroDocumento) {
        return promocionRepository.findByCreadorNumeroDocumento(numeroDocumento);
    }

    public Promocion actualizarPromocion(Long id, Promocion promocionActualizada) {
        Promocion promocion = promocionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada"));

        if (promocionActualizada.getPorcentajeDescuento() != null) {
            promocion.setPorcentajeDescuento(promocionActualizada.getPorcentajeDescuento());
            
            // Recalcular precio promoción
            BigDecimal precioOriginal = promocion.getProducto().getPrecio();
            BigDecimal descuento = promocionActualizada.getPorcentajeDescuento().divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            BigDecimal precioPromocion = precioOriginal.subtract(precioOriginal.multiply(descuento));
            promocion.setPrecioPromocion(precioPromocion);
        }

        if (promocionActualizada.getFechaInicio() != null) {
            promocion.setFechaInicio(promocionActualizada.getFechaInicio());
        }

        if (promocionActualizada.getFechaVencimiento() != null) {
            promocion.setFechaVencimiento(promocionActualizada.getFechaVencimiento());
        }

        if (promocionActualizada.getActivo() != null) {
            promocion.setActivo(promocionActualizada.getActivo());
        }

        return promocionRepository.save(promocion);
    }

    public Promocion cambiarEstado(Long id, Boolean activo) {
        Promocion promocion = promocionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada"));
        promocion.setActivo(activo);
        return promocionRepository.save(promocion);
    }

    public void eliminarPromocion(Long id) {
        promocionRepository.deleteById(id);
    }
}
