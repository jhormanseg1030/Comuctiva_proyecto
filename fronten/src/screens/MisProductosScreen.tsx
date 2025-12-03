import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productService, getFullUrl } from '../services/api';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenUrl?: string;
  stock: number;
  estado?: string;
}

const MisProductosScreen = ({ navigation }: any) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user');
      let userId = null;
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id || user.usuario?.id || user.user?.id || user.numeroDocumento || user.documento;
        setUserId(userId);
      }
      try {
        // Si tienes un endpoint para productos por usuario, úsalo aquí:
        // const res = await productService.getByUser(userId);
        // Si no, filtra en frontend:
        const res = await productService.getAll();
        const all = res.data || [];
        // Ajusta aquí el filtro según el campo correcto
        const mine = userId ? all.filter((p: any) => {
          // Compara con usuarioDocumento
          return String(p.usuarioDocumento) === String(userId);
        }) : [];
        setProductos(mine);
      } catch (err) {
        Alert.alert('Error', 'No se pudieron cargar tus productos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDesactivar = async (id: number) => {
    try {
      const producto = productos.find(p => p.id === id);
      if (!producto) throw new Error('Producto no encontrado');
      // Construir payload solo con campos primitivos y IDs de relaciones
      const payload: any = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        descripcion: producto.descripcion,
        stock: producto.stock,
        activo: false,
      };
      // Si el producto tiene categoria y usuario, enviar solo el id
      if ((producto as any).categoria?.id) {
        payload.categoria = { id: (producto as any).categoria.id };
      }
      if ((producto as any).usuario?.id) {
        payload.usuario = { id: (producto as any).usuario.id };
      }
      await productService.update(id, payload);
      Alert.alert('Desactivado', 'El producto ha sido desactivado');
      // Recargar productos
      const resAll = await productService.getAll();
      const all = resAll.data || [];
      const mine = userId ? all.filter((p: any) => String(p.usuarioDocumento) === String(userId)) : [];
      setProductos(mine);
    } catch (err: any) {
      console.log('Error al desactivar:', err?.response?.data || err);
      Alert.alert('Error', 'No se pudo desactivar el producto');
    }
  };

  const renderItem = ({ item }: { item: Producto }) => (
    <View style={styles.card}>
      <Image source={{ uri: getFullUrl(item.imagenUrl) || 'https://via.placeholder.com/300x200?text=Producto' }} style={styles.image} />
      <View style={styles.cardBody}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={[styles.estado, { backgroundColor: item.estado === 'Activo' ? '#22c55e' : '#fbbf24' }]}> {item.estado || 'Activo'} </Text>
        </View>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
        <Text style={styles.precio}>${item.precio?.toLocaleString('es-CO')} <Text style={styles.stock}>Stock: {item.stock}</Text></Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnDesactivar} onPress={() => handleDesactivar(item.id)}>
            <Text style={styles.btnDesactivarText}>Desactivar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnEditar} onPress={() => navigation.navigate('EditarProducto', { producto: item })}>
            <Text style={styles.btnEditarText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Productos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#64748b' }}>No tienes productos publicados.</Text>}
        />
      )}
      <View style={styles.bottomBtnWrapper}>
        <TouchableOpacity style={styles.btnNuevo} onPress={() => navigation.navigate('CreateProduct')}>
          <Text style={styles.btnNuevoText}>+ Publicar Nuevo Producto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#16a34a', marginTop: 24, marginBottom: 10, textAlign: 'center' },
  bottomBtnWrapper: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  btnNuevo: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  btnNuevoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 18, overflow: 'hidden', elevation: 2 },
  image: { width: '100%', height: 180, resizeMode: 'cover' },
  cardBody: { padding: 14 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  estado: { fontSize: 13, color: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, overflow: 'hidden', marginLeft: 8 },
  descripcion: { color: '#64748b', marginTop: 2, marginBottom: 6 },
  precio: { color: '#2563eb', fontWeight: 'bold', fontSize: 16 },
  stock: { color: '#64748b', fontWeight: 'normal', fontSize: 14 },
  actions: { flexDirection: 'row', marginTop: 10 },
  btnDesactivar: { flex: 1, borderWidth: 1, borderColor: '#fbbf24', borderRadius: 8, paddingVertical: 8, marginRight: 8 },
  btnDesactivarText: { color: '#f59e42', textAlign: 'center', fontWeight: 'bold' },
  btnEditar: { flex: 1, borderWidth: 1, borderColor: '#2563eb', borderRadius: 8, paddingVertical: 8 },
  btnEditarText: { color: '#2563eb', textAlign: 'center', fontWeight: 'bold' },
});

export default MisProductosScreen;
