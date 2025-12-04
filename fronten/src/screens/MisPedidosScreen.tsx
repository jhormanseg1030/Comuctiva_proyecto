import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, pedidosService } from '../services/api';

interface Pedido {
  id: number;
  fechaPedido: string;
  estadoPedido: string;
  total: number;
  direccionEntrega?: string;
  metodoPago: string;
  productos: any[];
}

const MisPedidosScreen = ({ navigation, route }: any) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  // Obtener información del usuario desde los parámetros de navegación
  const isLoggedIn = route?.params?.isLoggedIn || false;
  const userDocument = route?.params?.userDocument || '';
  const userName = route?.params?.userName || '';

  useEffect(() => {
    console.log('Usuario logueado:', isLoggedIn);
    console.log('Documento del usuario:', userDocument);
    console.log('Nombre del usuario:', userName);
    loadUserPedidos();
  }, []);

  const loadUserPedidos = async () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }
    
    setLoading(true);
    try {
      // Verificar token y usuario antes de la petición
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const userObj = user ? JSON.parse(user) : null;
      
      console.log('Token disponible:', token ? 'SÍ' : 'NO');
      console.log('Usuario almacenado:', userObj);
      console.log('Documento del usuario:', userObj?.numeroDocumento);
      console.log('Parámetros de navegación - userDocument:', userDocument);
      
      console.log('🔍 CONSULTANDO PEDIDOS PARA USUARIO:', userObj?.numeroDocumento || 'DESCONOCIDO');
      
      const response = await pedidosService.getMisPedidos();
      
      console.log('📡 RESPUESTA COMPLETA DEL SERVIDOR:', response);
      console.log('📋 DATOS RECIBIDOS:', response.data);
      console.log('🔢 TIPO DE DATOS:', typeof response.data);
      console.log('📏 CANTIDAD:', response.data?.length || 0);
      console.log('✅ ES ARRAY?:', Array.isArray(response.data));
      
      if (response.data && response.data.length > 0) {
        console.log('✅ PEDIDOS ENCONTRADOS:', response.data);
      } else {
        console.log('❌ RESPUESTA VACÍA O NULA');
        console.log('🔍 Usuario consultado:', userObj?.numeroDocumento);
        console.log('⚠️ El backend devuelve array vacío - no hay pedidos para este usuario');
      }
      
      if (response.data && Array.isArray(response.data)) {
        // Adaptar los datos del backend al formato esperado por el frontend
        const pedidosAdaptados = response.data.map((pedido: any) => ({
          id: pedido.id,
          fechaPedido: pedido.fechaPedido,
          estadoPedido: pedido.estadoPedido,
          total: pedido.total,
          direccionEntrega: pedido.direccionEntrega,
          metodoPago: pedido.metodoPago,
          usuarioNombre: pedido.usuarioNombre,
          usuarioDocumento: pedido.usuarioDocumento,
          usuarioTelefono: pedido.usuarioTelefono,
          usuarioEmail: pedido.usuarioEmail,
          conFlete: pedido.conFlete,
          costoFlete: pedido.costoFlete,
          detalles: pedido.detalles,
          productos: (pedido.detalles || []).map((detalle: any) => ({
            nombre: detalle.nombreProducto || detalle.nombre || 'Producto',
            cantidad: detalle.cantidad || 1,
            precio: detalle.precio || detalle.precioUnitario || 0
          }))
        }));
        
        setPedidos(pedidosAdaptados);
        console.log('✅ Pedidos adaptados y establecidos correctamente');
      } else {
        setPedidos([]);
        console.log('No se recibieron pedidos válidos');
      }
      setError(null);
    } catch (error: any) {
      console.error('Error cargando pedidos:', error);
      console.error('Status del error:', error.response?.status);
      console.error('Mensaje del error:', error.response?.data);
      
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      } else {
        setError('Error al cargar pedidos');
        setPedidos([]);
      }
    } finally {
      setLoading(false);
    }
  };



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
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return 'Confirmado';
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

  const renderPedido = (pedido: Pedido) => (
    <View key={pedido.id} style={styles.pedidoCard}>
      <View style={styles.pedidoHeader}>
        <View>
          <Text style={styles.pedidoId}>Pedido</Text>
          <Text style={styles.pedidoDate}>{formatDate(pedido.fechaPedido)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pedido.estadoPedido) }]}>
          <Text style={styles.statusText}>{getStatusText(pedido.estadoPedido)}</Text>
        </View>
      </View>

      <View style={styles.pedidoContent}>
        <View style={styles.pedidoRow}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.total}>${pedido.total.toLocaleString()}</Text>
        </View>

        <View style={styles.pedidoRow}>
          <Text style={styles.label}>Método de pago:</Text>
          <Text style={styles.value}>{getPaymentMethodText(pedido.metodoPago)}</Text>
        </View>

        <View style={styles.pedidoRow}>
          <Text style={styles.label}>Entrega:</Text>
          <Text style={styles.value}>{pedido.direccionEntrega}</Text>
        </View>

        <View style={styles.productosContainer}>
          <Text style={styles.label}>Productos:</Text>
          {(pedido.productos || []).map((producto, index) => (
            <Text key={index} style={styles.producto}>
              • {producto.nombre || 'Producto'} (x{producto.cantidad || 1}) - ${(producto.precio || 0).toLocaleString()}
            </Text>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.verDetalleButton}
        onPress={() => navigation.navigate('DetallePedido', { pedido })}
      >
        <Text style={styles.verDetalleText}>Ver detalle</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            setLoading(true);
            loadUserPedidos();
          }}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadUserPedidos}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : pedidos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No tienes pedidos</Text>
            <Text style={styles.emptyMessage}>
              Cuando realices una compra, tus pedidos aparecerán aquí.
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home', {
                isLoggedIn: isLoggedIn,
                userDocument: userDocument,
                userName: userName
              })}
            >
              <Text style={styles.shopButtonText}>Ir a comprar</Text>
            </TouchableOpacity>

          </View>
        ) : (
          <View style={styles.pedidosList}>
            <Text style={styles.pedidosCount}>
              {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
            </Text>
            {pedidos.map(renderPedido)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  backButton: {
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  statusDot: {
    fontSize: 8,
    marginRight: 4,
  },
  connectionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pedidosList: {
    paddingBottom: 20,
  },
  pedidosCount: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    fontWeight: '500',
  },
  pedidoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pedidoId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pedidoDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pedidoContent: {
    padding: 16,
  },
  pedidoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  total: {
    fontSize: 18,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  productosContainer: {
    marginTop: 8,
  },
  producto: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    marginLeft: 8,
  },
  verDetalleButton: {
    margin: 16,
    marginTop: 0,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  verDetalleText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
});

export default MisPedidosScreen;