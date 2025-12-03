import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define las rutas que usas en la navegación
export type UsuarioMenuStackParamList = {
  MiCuenta: undefined;
  MisPedidos: undefined;
  PublicarProducto: undefined;
  MisProductos: undefined;
  MisVentas: undefined;
  Home: undefined;
};

interface Props {
  navigation: StackNavigationProp<UsuarioMenuStackParamList>;
}

const UsuarioMenuScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menú de Usuario</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MiCuenta')}>
        <Text style={styles.menuText}>Mi Cuenta</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MisPedidos')}>
        <Text style={styles.menuText}>Mis Pedidos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PublicarProducto')}>
        <Text style={styles.menuText}>Publicar Producto</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MisProductos')}>
        <Text style={styles.menuText}>Mis Productos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MisVentas')}>
        <Text style={styles.menuText}>Mis Ventas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => navigation.replace('Home')}>
        <Text style={[styles.menuText, { color: '#dc2626', fontWeight: 'bold' }]}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#22c55e',
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e6eef0',
  },
  menuText: {
    fontSize: 17,
    color: '#0f172a',
  },
});

export default UsuarioMenuScreen;
