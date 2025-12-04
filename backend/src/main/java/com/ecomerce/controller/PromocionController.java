package com.ecomerce.controller;

import com.ecomerce.dto.MessageResponse;
import com.ecomerce.dto.PromocionDTO;
import com.ecomerce.model.Promocion;
import com.ecomerce.service.PromocionService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
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
    @Transactional
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
            return ResponseEntity.status(HttpStatus.CREATED).body(new PromocionDTO(nuevaPromocion));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<PromocionDTO>> obtenerTodasPromociones() {
        return ResponseEntity.ok(promocionService.obtenerTodasPromociones()
                .stream()
                .map(PromocionDTO::new)
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/vigentes")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PromocionDTO>> obtenerPromocionesVigentes() {
        return ResponseEntity.ok(promocionService.obtenerPromocionesVigentes()
                .stream()
                .map(PromocionDTO::new)
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerPromocionPorId(@PathVariable Long id) {
        return promocionService.obtenerPromocionPorId(id)
                .map(p -> ResponseEntity.ok(new PromocionDTO(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/producto/{productoId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PromocionDTO>> obtenerPromocionesPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(promocionService.obtenerPromocionesPorProducto(productoId)
                .stream()
                .map(PromocionDTO::new)
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/producto/{productoId}/vigentes")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PromocionDTO>> obtenerPromocionesVigentesPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(promocionService.obtenerPromocionesVigentesPorProducto(productoId)
                .stream()
                .map(PromocionDTO::new)
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/creador/{numeroDocumento}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PromocionDTO>> obtenerPromocionesPorCreador(@PathVariable String numeroDocumento) {
        return ResponseEntity.ok(promocionService.obtenerPromocionesPorCreador(numeroDocumento)
                .stream()
                .map(PromocionDTO::new)
                .collect(java.util.stream.Collectors.toList()));
    }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
        @Transactional
        public ResponseEntity<?> actualizarPromocion(
            @PathVariable Long id,
            @RequestBody Promocion promocion) {
        try {
            Promocion promocionActualizada = promocionService.actualizarPromocion(id, promocion);
            return ResponseEntity.ok(new PromocionDTO(promocionActualizada));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam Boolean activo) {
        try {
            Promocion promocion = promocionService.cambiarEstado(id, activo);
            return ResponseEntity.ok(new PromocionDTO(promocion));
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
