package com.ecomerce.controller;

import com.ecomerce.dto.CarritoDTO;
import com.ecomerce.dto.MessageResponse;
import com.ecomerce.model.Carrito;
import com.ecomerce.service.CarritoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/carrito")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CarritoController {

    @Autowired
    private CarritoService carritoService;

    // Obtener carrito del usuario autenticado
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> obtenerMiCarrito(Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            System.out.println("🛒 GET /carrito - Usuario: '" + numeroDocumento + "' (len=" + (numeroDocumento!=null?numeroDocumento.length():0) + ")");
            
            List<Carrito> carrito = carritoService.obtenerCarritoPorUsuario(numeroDocumento);
            
            List<CarritoDTO> carritoDTO = carrito.stream()
                    .map(CarritoDTO::new)
                    .collect(Collectors.toList());

            Double total = carritoService.calcularTotalCarrito(numeroDocumento);

            Map<String, Object> response = new HashMap<>();
            response.put("items", carritoDTO);
            response.put("total", total);
            response.put("cantidadItems", carritoDTO.size());
            response.put("usuario", numeroDocumento); // Agregar para debugging

            // Debug: imprimir ids de items recuperados
            System.out.println("🔎 Carrito raw items count: " + carrito.size());
            for (Carrito item : carrito) {
                Long itemId = item.getId();
                Long prodId = item.getProducto() != null ? item.getProducto().getId() : null;
                String userDoc = item.getUsuario() != null ? item.getUsuario().getNumeroDocumento() : null;
                System.out.println(" - itemId=" + itemId + ", productoId=" + prodId + ", usuarioDocumento='" + userDoc + "'");
            }

            System.out.println("✅ Carrito cargado: " + carritoDTO.size() + " items para " + numeroDocumento);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error al cargar carrito: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Agregar producto al carrito
    @PostMapping("/agregar")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> agregarAlCarrito(
            @RequestParam Long productoId,
            @RequestParam(defaultValue = "1") Integer cantidad,
            Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            System.out.println("🛒 POST /carrito/agregar - Usuario: '" + numeroDocumento + "', productoId=" + productoId + ", cantidad=" + cantidad);
            Carrito carrito = carritoService.agregarAlCarrito(numeroDocumento, productoId, cantidad);
            System.out.println("✅ Producto agregado. itemId=" + (carrito!=null?carrito.getId():null) + ", usuario='" + (carrito!=null && carrito.getUsuario()!=null?carrito.getUsuario().getNumeroDocumento():null) + "'");

            return ResponseEntity.ok(new CarritoDTO(carrito));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Actualizar cantidad de un item
    @PutMapping("/{carritoId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> actualizarCantidad(
            @PathVariable Long carritoId,
            @RequestParam Integer cantidad) {
        try {
            Carrito carrito = carritoService.actualizarCantidad(carritoId, cantidad);
            return ResponseEntity.ok(new CarritoDTO(carrito));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Eliminar item del carrito
    @DeleteMapping("/{carritoId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> eliminarDelCarrito(@PathVariable Long carritoId) {
        try {
            carritoService.eliminarDelCarrito(carritoId);
            return ResponseEntity.ok(new MessageResponse("Producto eliminado del carrito"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Vaciar carrito completo
    @DeleteMapping("/vaciar")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> vaciarCarrito(Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            carritoService.vaciarCarrito(numeroDocumento);
            return ResponseEntity.ok(new MessageResponse("Carrito vaciado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
