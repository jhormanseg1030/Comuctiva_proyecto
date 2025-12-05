import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { productService, cartService } from '../services/api';
import { getFullUrl } from '../services/api';
import { authService } from '../services/api';

const ProductDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params as { id: number };
  const isLoggedIn = route?.params?.isLoggedIn || false;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    productService.getById(id)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('No se pudo cargar el producto');
        setLoading(false);
      });

    // Obtener comentarios del producto
    productService.getComentarios(id)
      .then((res) => {
        console.log('Comentarios recibidos:', res.data); // DEBUG
        setComentarios(res.data.comentarios || []);
        setComentariosLoading(false);
      })
      .catch((err) => {
        console.log('Error al obtener comentarios:', err?.response?.data || err.message || err);
        setComentariosError('No se pudieron cargar los comentarios');
        setComentariosLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    console.log('🛒 Intentando agregar al carrito:', product?.nombre, 'Cantidad:', cantidad, 'Logueado:', isLoggedIn);

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setAddingToCart(true);
    try {
      const response = await cartService.addToCart(product.id, cantidad);
      console.log('✅ Producto agregado:', response?.data);
      setSuccessMessage(`${product.nombre} agregado al carrito`);
      setShowSuccessModal(true);
      setCantidad(1); // Reset cantidad
      // Auto cerrar después de 3 segundos
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error: any) {
      console.error('❌ Error:', error);
      const errorMessage = error?.response?.data?.message || 'Error al agregar al carrito';
      Alert.alert('❌ Error', errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementarCantidad = () => {
    if (cantidad < (product?.stock || 0)) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (error) {
    return <View style={styles.center}><Text>{error}</Text></View>;
  }

  if (!product) {
    return <View style={styles.center}><Text>Producto no encontrado</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.infoBox}>
        {/* Mostrar imagen principal dentro de la card */}
        <View style={styles.imageBox}>
          {(product.imagenUrl || product.imagen) && (
            <Image source={{ uri: getFullUrl(product.imagenUrl || product.imagen) }} style={styles.image} />
          )}
          {Array.isArray(product.imagenes) && product.imagenes.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryBox}>
              {product.imagenes.map((img: string, idx: number) => (
                <Image key={idx} source={{ uri: getFullUrl(img) }} style={styles.galleryImage} />
              ))}
            </ScrollView>
          )}
        </View>
        <Text style={styles.title}>{product.nombre}</Text>
        <Text style={styles.price}>${product.precio?.toLocaleString()}</Text>
        <Text style={styles.description}>{product.descripcion}</Text>
        {product.stock !== undefined && (
          <Text style={styles.stock}>Stock disponible: <Text style={{ fontWeight: 'bold' }}>{product.stock}</Text> unidades</Text>
        )}
        {product.especificaciones && (
          <View style={styles.specsBox}>
            <Text style={styles.specsTitle}>Especificaciones:</Text>
            <Text style={styles.specs}>{product.especificaciones}</Text>
          </View>
        )}
        <View style={styles.cartRow}>
          <Text style={styles.cantidadLabel}>Cantidad:</Text>
          <View style={styles.cantidadBox}>
            <TouchableOpacity onPress={decrementarCantidad}>
              <Text style={styles.cantidadBtn}>-</Text>
            </TouchableOpacity>
            <Text style={styles.cantidadValue}>{cantidad}</Text>
            <TouchableOpacity onPress={incrementarCantidad}>
              <Text style={styles.cantidadBtn}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.cartButton, (addingToCart || product?.stock === 0) && styles.cartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart || product?.stock === 0}
        >
          <Text style={styles.cartButtonText}>
            {addingToCart ? '⏳ Agregando...' : '🛒 Agregar al carrito'}
          </Text>
        </TouchableOpacity>
      </View>

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
                  navigation.navigate('Login' as never);
                }}
              >
                <Text style={styles.modalButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  imageBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 320,
    height: 220,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  galleryBox: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#22c55e',
    textAlign: 'left',
  },
  price: {
    fontSize: 22,
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  stock: {
    fontSize: 15,
    marginBottom: 10,
    color: '#15803d',
  },
  specsBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  specsTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specs: {
    fontSize: 15,
    color: '#555',
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  cantidadLabel: {
    fontSize: 15,
    marginRight: 8,
  },
  cantidadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cantidadBtn: {
    fontSize: 18,
    color: '#22c55e',
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
  cantidadValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  cartButton: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cartButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
export default ProductDetailScreen;
