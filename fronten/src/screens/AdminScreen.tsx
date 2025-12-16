import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productService, userService } from '../services/api';
import ProductItem from '../components/ProductItem';
import UserItem from '../components/UserItem';
import { StackNavigationProp } from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any>;
};

const AdminScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [view, setView] = useState<'menu' | 'products' | 'users'>('menu');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [pRes, uRes] = await Promise.all([productService.getAll(), userService.getAll()]);
      setProducts(pRes.data || []);
      setUsers(uRes.data || []);
    } catch (e) {
      console.warn('Error cargando datos admin', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const u = userStr ? JSON.parse(userStr) : null;
        const isAdmin = !!(
          u && (u.rol === 'ADMIN' || u.role === 'ADMIN' || u.roles?.some((r: any) => r === 'ADMIN' || r?.nombre === 'ADMIN') || u.isAdmin)
        );
        if (!isAdmin) {
          Alert.alert('Acceso denegado', 'No tienes permisos para acceder al panel administrativo');
          navigation.goBack();
          return;
        }
        await loadAll();
      } catch (e) {
        console.warn('error checking admin', e);
      }
    };
    checkAdminAndLoad();
  }, []);

  const toggleProductActive = async (item: any) => {
    try {
      // Use backend endpoint to change estado
      await productService.changeEstado(item.id, !item.activo);
      await loadAll();
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteProduct = (item: any) => {
    Alert.alert('Eliminar producto', `¿Eliminar ${item.nombre || item.titulo || 'producto'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await productService.delete(item.id); await loadAll(); } catch (e) { console.warn(e); }
      } }
    ]);
  };

  const toggleUserActive = async (u: any) => {
    try {
      // Backend expects numeroDocumento as identifier and a dedicated endpoint
      const identifier = u.numeroDocumento || u.documento || u.id || u.username;
      await userService.changeEstado(identifier, !u.activo);
      await loadAll();
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleUserRole = async (u: any) => {
    try {
      const newRole = (u.rol === 'ADMIN' || (u.roles || []).some((r: any) => r === 'ADMIN' || r?.nombre === 'ADMIN')) ? 'USER' : 'ADMIN';
      const identifier = u.numeroDocumento || u.documento || u.id || u.username;
      await userService.changeRol(identifier, newRole);
      await loadAll();
    } catch (e) {
      console.warn(e);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#22c55e" /></View>;

  // Menu view
  if (view === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Panel Admin</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              loadAll();
              setView('products');
            }}
          >
            <Text style={styles.menuButtonText}>📦 Consultar Productos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              loadAll();
              setView('users');
            }}
          >
            <Text style={styles.menuButtonText}>👥 Consultar Usuarios</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Products view
  if (view === 'products') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setView('menu')}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Productos</Text>
        <FlatList
          data={products}
          keyExtractor={(i) => String(i.id || i._id || i.codigo || i.nombre)}
          style={styles.list}
          renderItem={({ item }) => (
            <ProductItem
              item={item}
              onEdit={(it) => navigation.navigate('EditarProducto', { producto: it })}
              onToggleActive={toggleProductActive}
              onDelete={deleteProduct}
            />
          )}
        />
      </View>
    );
  }

  // Users view
  if (view === 'users') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setView('menu')}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Usuarios</Text>
        <FlatList
          data={users}
          keyExtractor={(i) => String(i.id || i._id || i.numeroDocumento || i.email)}
          style={styles.list}
          renderItem={({ item }) => (
            <UserItem item={item} onToggleActive={toggleUserActive} onChangeRole={toggleUserRole} />
          )}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#16a34a', textAlign: 'center', marginVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  list: { flex: 1 },
  item: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, elevation: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  subText: { fontSize: 13, color: '#64748b', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 8 },
  btn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#e6eef0', marginRight: 8 },
  btnText: { color: '#0f172a', fontWeight: '600' },
  menuContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  menuButton: { backgroundColor: '#22c55e', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 12, width: '80%', elevation: 4 },
  menuButtonText: { fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, marginBottom: 12 },
  backButtonText: { fontSize: 16, color: '#22c55e', fontWeight: '600' },
});

export default AdminScreen;
