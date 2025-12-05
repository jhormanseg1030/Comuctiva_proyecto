import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFullUrl, cartService } from '../services/api';
import { useIsFocused } from '@react-navigation/native';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl?: string;
  fechaPublicacion?: string;
}

const FAVORITES_KEY = '@comuctiva_favorites_v1';

const FavoritesScreen = ({ navigation, route }: any) => {
  const [favorites, setFavorites] = useState<Producto[]>([]);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isFocused = useIsFocused();
  const isLoggedIn = route?.params?.isLoggedIn || false;
  const userDocument = route?.params?.userDocument || '';
  const userName = route?.params?.userName || '';

  useEffect(() => {
    if (isFocused) loadFavorites();
  }, [isFocused]);

  const loadFavorites = async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw));
      else setFavorites([]);
    } catch (e) {
      console.warn('Error cargando favoritos', e);
    }
  };

  const removeFavorite = async (id: number) => {
    try {
      const next = favorites.filter(f => f.id !== id);
      setFavorites(next);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Error eliminando favorito', e);
    }
  };

  const handleAddToCart = async (producto: Producto) => {
    console.log('🛒 Intentando agregar desde favoritos:', producto.nombre, 'Logueado:', isLoggedIn);

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setAddingProductId(producto.id);
    try {
      const response = await cartService.addToCart(producto.id, 1);
      console.log('✅ Producto agregado:', response?.data);
      setSuccessMessage(`${producto.nombre} agregado al carrito`);
      setShowSuccessModal(true);
      // Auto cerrar después de 3 segundos
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error: any) {
      console.error('❌ Error:', error);
      const errorMessage = error?.response?.data?.message || 'Error al agregar al carrito';
      Alert.alert('❌ Error', errorMessage);
    } finally {
      setAddingProductId(null);
    }
  };

  const renderItem = ({ item }: { item: Producto }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        {item.imagenUrl ? (
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { 
            id: item.id,
            isLoggedIn: isLoggedIn,
            userDocument: userDocument,
            userName: userName
          })}>
            <Image source={{ uri: getFullUrl(item.imagenUrl) }} style={styles.image} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
        <View style={styles.info}>
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { 
            id: item.id,
            isLoggedIn: isLoggedIn,
            userDocument: userDocument,
            userName: userName
          })}>
            <Text style={styles.title} numberOfLines={2}>{item.nombre}</Text>
          </TouchableOpacity>
          <Text style={styles.price}>${item.precio.toLocaleString()}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.addToCartButton, addingProductId === item.id && styles.disabledButton]}
              onPress={() => handleAddToCart(item)}
              disabled={addingProductId === item.id}
            >
              <Text style={styles.addToCartText}>
                {addingProductId === item.id ? '⏳ Agregando...' : 'Agregar al carrito'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeFavorite(item.id)}>
              <Text style={styles.removeText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No tienes favoritos todavía</Text>
          <Text>Marca productos con el corazón para agregarlos aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}

      {/* Modal de éxito personalizado */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Text style={styles.iconText}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>¡Producto Agregado!</Text>
            <Text style={styles.modalMessage}>{successMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de login personalizado */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.loginIcon}>
              <Text style={styles.loginIconText}>🔐</Text>
            </View>
            <Text style={styles.modalTitle}>Debes iniciar sesión</Text>
            <Text style={styles.modalMessage}>Inicia sesión para agregar productos al carrito</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowLoginModal(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.modalButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', gap: 12 },
  image: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#e2e8f0' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  price: { fontSize: 14, fontWeight: '700', color: '#22c55e', marginTop: 6 },
  actionsRow: { flexDirection: 'row', marginTop: 10, gap: 8, alignItems: 'center' },
  addToCartButton: { backgroundColor: '#22c55e', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  addToCartText: { color: '#fff', fontWeight: '600' },
  disabledButton: { backgroundColor: '#ccc', opacity: 0.6 },
  removeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e11d48', marginLeft: 8 },
  removeText: { color: '#e11d48', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    width: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 14,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 23,
    fontWeight: '400',
  },
  modalButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loginIcon: {
    width: 85,
    height: 85,
    borderRadius: 42,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  loginIconText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default FavoritesScreen;
