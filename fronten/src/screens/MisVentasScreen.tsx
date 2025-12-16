import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any>;
};

const MisVentasScreen: React.FC<Props> = ({ navigation }) => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalVentas, setTotalVentas] = useState(0);

  useEffect(() => {
    loadMisVentas();
  }, []);

  const loadMisVentas = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.1.5:8080/api/pedidos/mis-ventas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setVentas(response.data || []);
      
      // Calcular total de ventas
      const total = (response.data || []).reduce((sum: number, venta: any) => {
        return sum + parseFloat(venta.subtotal || 0);
      }, 0);
      setTotalVentas(total);
    } catch (err: any) {
      console.warn('Error al cargar ventas:', err);
      Alert.alert('Error', 'No se pudo cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMisVentas();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Cargando ventas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Ventas</Text>

      {/* Resumen */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total de ventas:</Text>
        <Text style={styles.summaryValue}>{ventas.length}</Text>
        <Text style={styles.summaryLabel}>Ingresos totales:</Text>
        <Text style={styles.summaryValueGreen}>${totalVentas.toFixed(2)}</Text>
      </View>

      {/* Lista de ventas */}
      {ventas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes ventas aún</Text>
          <Text style={styles.emptySubtext}>Cuando tus productos sean comprados, aparecerán aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={ventas}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.ventaItem}
              onPress={() => navigation.navigate('DetallePedido', { pedidoId: item.pedido?.id || item.id })}
            >
              <View style={styles.ventaHeader}>
                <Text style={styles.ventaDate}>
                  {item.pedido?.fechaPedido ? formatDate(item.pedido.fechaPedido) : 'N/A'}
                </Text>
                <Text style={styles.ventaTotal}>${parseFloat(item.subtotal || 0).toFixed(2)}</Text>
              </View>

              <View style={styles.ventaRow}>
                <View style={styles.ventaColumn}>
                  <Text style={styles.label}>Producto</Text>
                  <Text style={styles.value}>{item.producto?.nombre || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.ventaRow}>
                <View style={styles.ventaColumn}>
                  <Text style={styles.label}>Comprador</Text>
                  <Text style={styles.value}>{item.pedido?.compradorNombre || 'N/A'}</Text>
                </View>
                <View style={styles.ventaColumn}>
                  <Text style={styles.label}>Cantidad</Text>
                  <Text style={styles.value}>{item.cantidad}</Text>
                </View>
              </View>

              <View style={styles.ventaRow}>
                <View style={styles.ventaColumn}>
                  <Text style={styles.label}>Precio Unit.</Text>
                  <Text style={styles.value}>${parseFloat(item.precioUnitario || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.ventaColumn}>
                  <Text style={styles.label}>Pedido ID</Text>
                  <Text style={[styles.value, styles.pedidoBadge]}>#{item.pedido?.id || 'N/A'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#64748b', fontSize: 14 },
  title: { fontSize: 22, fontWeight: '700', color: '#16a34a', textAlign: 'center', marginVertical: 12 },
  
  summaryBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  summaryLabel: { fontSize: 13, color: '#64748b', marginTop: 6 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  summaryValueGreen: { fontSize: 18, fontWeight: '700', color: '#16a34a' },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#64748b', textAlign: 'center', paddingHorizontal: 20 },
  
  ventaItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  ventaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  ventaDate: { fontSize: 12, color: '#64748b' },
  ventaTotal: { fontSize: 16, fontWeight: '700', color: '#16a34a' },
  
  ventaRow: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  ventaColumn: { flex: 1, paddingRight: 8 },
  label: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  pedidoBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
});

export default MisVentasScreen;
