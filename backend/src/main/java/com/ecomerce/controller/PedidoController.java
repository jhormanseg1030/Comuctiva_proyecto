package com.ecomerce.controller;

import com.ecomerce.dto.DetallePedidoDTO;
import com.ecomerce.dto.MessageResponse;
import com.ecomerce.dto.PedidoDTO;
import com.ecomerce.model.DetallePedido;
import com.ecomerce.model.Pedido;
import com.ecomerce.service.PedidoService;
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
@RequestMapping("/pedidos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // Crear pedido desde carrito
    @PostMapping("/crear")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> crearPedido(
            @RequestParam(required = false) String direccionEnvio,
            @RequestParam(required = false) String metodoPago,
            @RequestParam(required = false, defaultValue = "0") Double costoFlete,
            Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            Pedido pedido = pedidoService.crearPedidoDesdeCarrito(numeroDocumento, direccionEnvio, metodoPago, costoFlete);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(new PedidoDTO(pedido));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Obtener mis pedidos
    @GetMapping("/mis-pedidos")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> obtenerMisPedidos(Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            List<PedidoDTO> pedidosDTO = pedidoService.obtenerPedidosPorUsuarioDTO(numeroDocumento);
            return ResponseEntity.ok(pedidosDTO);
        } catch (Exception e) {
            // Registrar el error completo en el servidor (no exponer al cliente)
            e.printStackTrace();

            // Devolver mensaje genérico al cliente
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error interno del servidor"));
        }
    }

    // Obtener mis ventas (productos que he vendido)
    @GetMapping("/mis-ventas")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> obtenerMisVentas(Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            List<DetallePedidoDTO> ventasDTO = pedidoService.obtenerVentasPorVendedorDTO(numeroDocumento);
            return ResponseEntity.ok(ventasDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Obtener todos los pedidos (ADMIN)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> obtenerTodosPedidos() {
        try {
            List<PedidoDTO> pedidosDTO = pedidoService.obtenerTodosPedidosDTO();
            return ResponseEntity.ok(pedidosDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Obtener detalle de un pedido
    @GetMapping("/{pedidoId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> obtenerDetallePedido(
            @PathVariable Long pedidoId,
            Authentication authentication) {
        try {
            PedidoDTO pedidoDTO = pedidoService.obtenerPedidoDTOPorId(pedidoId);

            // Verificar que el usuario puede ver este pedido
            if (!authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                if (!pedidoDTO.getUsuarioDocumento().equals(authentication.getName())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new MessageResponse("No tienes permiso para ver este pedido"));
                }
            }

            List<DetallePedidoDTO> detallesDTO = pedidoService.obtenerDetallesPedidoDTO(pedidoId);

            Map<String, Object> response = new HashMap<>();
            response.put("pedido", pedidoDTO);
            response.put("detalles", detallesDTO);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Actualizar estado del pedido (ADMIN)
    @PutMapping("/{pedidoId}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Long pedidoId,
            @RequestParam String estado) {
        try {
                PedidoDTO pedidoDTO = pedidoService.actualizarEstadoPedido(pedidoId, estado);
                return ResponseEntity.ok(pedidoDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Cancelar pedido
    @PutMapping("/{pedidoId}/cancelar")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelarPedido(
            @PathVariable Long pedidoId,
            Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            PedidoDTO pedidoDTO = pedidoService.cancelarPedido(pedidoId, numeroDocumento);
            
            return ResponseEntity.ok(pedidoDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Eliminar pedido
    @DeleteMapping("/{pedidoId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> eliminarPedido(
            @PathVariable Long pedidoId,
            Authentication authentication) {
        try {
            String numeroDocumento = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            pedidoService.eliminarPedido(pedidoId, numeroDocumento, isAdmin);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
