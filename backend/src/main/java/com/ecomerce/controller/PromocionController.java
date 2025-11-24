package com.ecomerce.controller;

import com.ecomerce.dto.MessageResponse;
import com.ecomerce.model.Promocion;
import com.ecomerce.service.PromocionService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/promociones")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PromocionController {

    @Autowired
    private PromocionService promocionService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> crearPromocion(@Valid @RequestBody PromocionRequest request) {
        try {
            Promocion promocion = new Promocion();
            promocion.setPorcentajeDescuento(request.getPorcentajeDescuento());
            promocion.setFechaInicio(request.getFechaInicio());
            promocion.setFechaVencimiento(request.getFechaVencimiento());
            promocion.setActivo(true);

            Promocion nuevaPromocion = promocionService.crearPromocion(
                promocion,
                request.getProductoId(),
                request.getCreadorDocumento()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaPromocion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Promocion>> obtenerTodasPromociones() {
        return ResponseEntity.ok(promocionService.obtenerTodasPromociones());
    }

    @GetMapping("/vigentes")
    public ResponseEntity<List<Promocion>> obtenerPromocionesVigentes() {
        return ResponseEntity.ok(promocionService.obtenerPromocionesVigentes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPromocionPorId(@PathVariable Long id) {
        return promocionService.obtenerPromocionPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Promocion>> obtenerPromocionesPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(promocionService.obtenerPromocionesPorProducto(productoId));
    }

    @GetMapping("/producto/{productoId}/vigentes")
    public ResponseEntity<List<Promocion>> obtenerPromocionesVigentesPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(promocionService.obtenerPromocionesVigentesPorProducto(productoId));
    }

    @GetMapping("/creador/{numeroDocumento}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Promocion>> obtenerPromocionesPorCreador(@PathVariable String numeroDocumento) {
        return ResponseEntity.ok(promocionService.obtenerPromocionesPorCreador(numeroDocumento));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> actualizarPromocion(
            @PathVariable Long id,
            @Valid @RequestBody Promocion promocion) {
        try {
            Promocion promocionActualizada = promocionService.actualizarPromocion(id, promocion);
            return ResponseEntity.ok(promocionActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam Boolean activo) {
        try {
            Promocion promocion = promocionService.cambiarEstado(id, activo);
            return ResponseEntity.ok(promocion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarPromocion(@PathVariable Long id) {
        try {
            promocionService.eliminarPromocion(id);
            return ResponseEntity.ok(new MessageResponse("Promoción eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @Data
    public static class PromocionRequest {
        private Long productoId;
        private String creadorDocumento;
        private BigDecimal porcentajeDescuento;
        private LocalDateTime fechaInicio;
        private LocalDateTime fechaVencimiento;
    }
}
