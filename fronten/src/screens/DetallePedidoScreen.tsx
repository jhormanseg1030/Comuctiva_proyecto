import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const DetallePedidoScreen = ({ navigation, route }: any) => {
  const { pedido } = route.params || {};

  if (!pedido) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: No se encontró información del pedido</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return '#f59e0b';
      case 'ENTREGADO':
        return '#10b981';
      case 'CANCELADO':
        return '#ef4444';
      case 'PENDIENTE':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return 'Confirmado';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ENTREGADO':
        return 'Entregado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'efectivo':
        return '💵 Efectivo';
      case 'nequi':
        return '📱 Nequi';
      case 'daviplata':
        return '📲 Daviplata';
      default:
        return method;
    }
  };

  const getProductos = () => {
    // Si ya tiene productos adaptados, usarlos
    if (pedido.productos && pedido.productos.length > 0) {
      return pedido.productos;
    }
    // Si no, adaptar desde detalles del backend
    return (pedido.detalles || []).map((detalle: any) => ({
      nombre: detalle.nombreProducto || detalle.nombre || 'Producto',
      cantidad: detalle.cantidad || 1,
      precio: detalle.precio || detalle.precioUnitario || 0
    }));
  };

  const calculateSubtotal = () => {
    return getProductos().reduce((sum: number, producto: any) => {
      return sum + (producto.precio * producto.cantidad);
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Pedido</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado Actual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estado Actual</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pedido.estadoPedido) }]}>
              <Text style={styles.statusText}>{getStatusText(pedido.estadoPedido)}</Text>
            </View>
            <Text style={styles.statusDate}>Actualizado: {formatDate(pedido.fechaPedido)}</Text>
          </View>
        </View>

        {/* Información del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Información del Cliente</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre completo:</Text>
              <Text style={styles.infoValue}>{pedido.usuarioNombre || 'No disponible'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Documento:</Text>
              <Text style={styles.infoValue}>{pedido.usuarioDocumento || 'No disponible'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{pedido.usuarioTelefono || 'No disponible'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{pedido.usuarioEmail || 'No disponible'}</Text>
            </View>
          </View>
        </View>

        {/* Productos Detallados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Productos Detallados</Text>
          <View style={styles.productosContainer}>
            {getProductos().map((producto: any, index: number) => (
              <View key={index} style={styles.productoCard}>
                <View style={styles.productoHeader}>
                  <Text style={styles.productoNombre}>{producto.nombre}</Text>
                  <Text style={styles.productoSubtotal}>
                    ${(producto.precio * producto.cantidad).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.productoDescripcion}>
                  Precio unitario: ${producto.precio.toLocaleString()}
                </Text>
                <Text style={styles.productoCantidad}>
                  Cantidad: {producto.cantidad}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Información de Entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚚 Información de Entrega</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>{pedido.direccionEntrega}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de envío:</Text>
              <Text style={styles.infoValue}>
                {pedido.direccionEntrega === 'Recogido en tienda' ? 'Recogida en tienda' : 'Domicilio'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Costo de envío:</Text>
              <Text style={styles.infoValue}>
                {pedido.conFlete ? `$${pedido.costoFlete?.toLocaleString() || 0}` : 'Gratis'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tiempo estimado:</Text>
              <Text style={styles.infoValue}>
                {pedido.direccionEntrega === 'Recogido en tienda' ? 'Disponible ahora' : '2-3 días hábiles'}
              </Text>
            </View>
          </View>
        </View>

        {/* Detalles de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Detalles de Pago</Text>
          <View style={styles.paymentContainer}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Método de pago:</Text>
              <Text style={styles.paymentValue}>{getPaymentMethodText(pedido.metodoPago)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Estado del pago:</Text>
              <Text style={[styles.paymentValue, { color: '#f59e0b' }]}>
                {pedido.estadoPedido === 'PENDIENTE' ? 'Pendiente' : 'Pagado'}
              </Text>
            </View>
            
            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal productos:</Text>
                <Text style={styles.summaryValue}>${calculateSubtotal().toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Costo de envío:</Text>
                <Text style={styles.summaryValue}>
                  ${(pedido.costoFlete || 0).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total final:</Text>
                <Text style={styles.totalValue}>${pedido.total.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fef9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#22c55e',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  productosContainer: {
    gap: 12,
  },
  productoCard: {
    backgroundColor: '#f7fef9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  productoSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  productoDescripcion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  productoCantidad: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentContainer: {
    gap: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  paymentSummary: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
});

export default DetallePedidoScreen;