import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

// Define las rutas que usas en la navegación
export type UsuarioMenuStackParamList = {
  Account: undefined;
  MisPedidos: {
    isLoggedIn: boolean;
    userDocument: string;
    userName: string;
  };
  CreateProduct: undefined;
  MisProductos: undefined;
  MisVentas: undefined;
  Home: undefined;
  Admin: undefined;
};

interface Props {
  navigation: StackNavigationProp<UsuarioMenuStackParamList>;
}

const UsuarioMenuScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const isAdmin = !!(
    user && (
      user.rol === 'ADMIN' || user.role === 'ADMIN' || user.roles?.some((r: any) => r === 'ADMIN' || r?.nombre === 'ADMIN' || r?.name === 'ADMIN') ||
      user.authorities?.some((a: any) => a === 'ROLE_ADMIN' || a === 'ADMIN') || user.isAdmin
    )
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.profileCard}>
        {loading ? (
          <ActivityIndicator size="large" color="#22c55e" />
        ) : user ? (
          <>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {user.nombre
                    ? user.nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)
                    : (user.email ? user.email[0].toUpperCase() : 'U')}
                </Text>
              </View>
            </View>
            <Text style={styles.profileName}>{user.nombre || user.email || 'Usuario'}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileDoc}>Documento: {user.numeroDocumento || user.documento || '-'}</Text>
          </>
        ) : (
          <Text style={styles.profileName}>No se pudo cargar el usuario</Text>
        )}
      </View>
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Account')}>
          <Text style={styles.menuText}>Mi Cuenta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MisPedidos', {
          isLoggedIn: true,
          userDocument: user?.documento || user?.username || '',
          userName: user?.nombre || user?.username || ''
        })}>
          <Text style={styles.menuText}>Mis Pedidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CreateProduct')}>
          <Text style={styles.menuText}>Publicar Producto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MisProductos')}>
          <Text style={styles.menuText}>Mis Productos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MisVentas')}>
          <Text style={styles.menuText}>Mis Ventas</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Admin')}>
            <Text style={[styles.menuText, { fontWeight: '700', color: '#16a34a' }]}>Admin</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => navigation.replace('Home')}>
          <Text style={[styles.menuText, { color: '#dc2626', fontWeight: 'bold' }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 12,
    textAlign: 'center',
    color: '#22c55e',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 18,
  },
  avatarWrapper: {
    marginBottom: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e6eef0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 2,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 2,
    textAlign: 'center',
  },
  profileDoc: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 2,
    textAlign: 'center',
  },
  menuList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    paddingVertical: 8,
    elevation: 1,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e6eef0',
    paddingHorizontal: 18,
  },
  menuText: {
    fontSize: 17,
    color: '#0f172a',
  },
});

export default UsuarioMenuScreen;
