import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StyleSheet,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cartStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfdf5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
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
    backgroundColor: '#f0fdf4',
  },
  backButtonText: {
    fontSize: 24,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 15,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
  clearButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  registerButtonText: {
    color: '#374151',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemsHeader: {
    paddingVertical: 15,
  },
  itemsCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
  removeButtonText: {
    fontSize: 18,
  },
  summary: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  checkoutButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos para modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 300,
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalIconText: {
    fontSize: 50,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ef4444',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  descripcion?: string;
}

const CartScreen = ({ navigation, route }: any) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  
  // Obtener parámetros de navegación para saber si está logueado
  const isLoggedIn = route?.params?.isLoggedIn || false;

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const updateCartItem = async (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartItem(id);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, cantidad: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeCartItem = (id: number) => {
    setItemToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      const updatedCart = cartItems.filter(item => item.id !== itemToDelete);
      setCartItems(updatedCart);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      setItemToDelete(null);
    }
    setShowDeleteDialog(false);
  };

  const clearCart = () => {
    setItemToDelete('all');
    setShowDeleteDialog(true);
  };

  const confirmClearCart = async () => {
    setCartItems([]);
    await AsyncStorage.removeItem('cart');
    setShowDeleteDialog(false);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const calculateItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.cantidad, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }
    navigation.navigate('CheckoutScreen', { cartItems, total: calculateTotal() });
  };

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={cartStyles.cartItem}>
      <Image
        source={{ uri: item.imagen }}
        style={cartStyles.productImage}
      />
      
      <View style={cartStyles.productInfo}>
        <Text style={cartStyles.productName}>{item.nombre}</Text>
        <Text style={cartStyles.productPrice}>${item.precio.toLocaleString()}</Text>
        {item.descripcion && (
          <Text style={cartStyles.productDescription} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
      </View>

      <View style={cartStyles.quantityContainer}>
        <TouchableOpacity
          style={cartStyles.quantityButton}
          onPress={() => updateCartItem(item.id, item.cantidad - 1)}
        >
          <Text style={cartStyles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={cartStyles.quantityText}>{item.cantidad}</Text>
        
        <TouchableOpacity
          style={cartStyles.quantityButton}
          onPress={() => updateCartItem(item.id, item.cantidad + 1)}
        >
          <Text style={cartStyles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={cartStyles.removeButton}
        onPress={() => removeCartItem(item.id)}
      >
        <Text style={cartStyles.removeButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDeleteDialog = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDeleteDialog}
      onRequestClose={() => setShowDeleteDialog(false)}
    >
      <View style={cartStyles.modalOverlay}>
        <View style={cartStyles.modalContent}>
          <View style={cartStyles.modalIcon}>
            <Text style={cartStyles.modalIconText}>🗑️</Text>
          </View>
          
          <Text style={cartStyles.modalTitle}>
            {itemToDelete === 'all' ? 'Vaciar carrito' : 'Eliminar producto'}
          </Text>
          <Text style={cartStyles.modalMessage}>
            {itemToDelete === 'all' 
              ? '¿Estás seguro de que quieres vaciar todo el carrito?'
              : '¿Estás seguro de que quieres eliminar este producto del carrito?'
            }
          </Text>

          <View style={cartStyles.modalButtons}>
            <TouchableOpacity 
              style={cartStyles.modalCancelButton}
              onPress={() => setShowDeleteDialog(false)}
            >
              <Text style={cartStyles.modalCancelText}>CANCELAR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={cartStyles.modalConfirmButton}
              onPress={itemToDelete === 'all' ? confirmClearCart : confirmDelete}
            >
              <Text style={cartStyles.modalConfirmText}>
                {itemToDelete === 'all' ? 'VACIAR' : 'ELIMINAR'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={cartStyles.container}>
      {/* Header */}
      <View style={cartStyles.header}>
        <TouchableOpacity
          style={cartStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={cartStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={cartStyles.headerTitle}>Mi Carrito</Text>
        
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={cartStyles.clearButton}
            onPress={clearCart}
          >
            <Text style={cartStyles.clearButtonText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {!isLoggedIn ? (
        <View style={cartStyles.emptyContainer}>
          <Text style={cartStyles.emptyIcon}>🛒</Text>
          <Text style={cartStyles.emptyTitle}>Tu Carro está vacío</Text>
          <Text style={cartStyles.emptyMessage}>
            Inicia sesión para ver los productos que habías guardado en tu Carro.
          </Text>
          <TouchableOpacity
            style={cartStyles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={cartStyles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={cartStyles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={cartStyles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={cartStyles.emptyContainer}>
          <Text style={cartStyles.emptyIcon}>🛒</Text>
          <Text style={cartStyles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={cartStyles.emptyMessage}>
            Agrega productos para comenzar a comprar
          </Text>
          <TouchableOpacity
            style={cartStyles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={cartStyles.shopButtonText}>Explorar productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Items List */}
          <ScrollView style={cartStyles.itemsList} showsVerticalScrollIndicator={false}>
            <View style={cartStyles.itemsHeader}>
              <Text style={cartStyles.itemsCount}>
                {calculateItemsCount()} {calculateItemsCount() === 1 ? 'producto' : 'productos'}
              </Text>
            </View>
            
            {cartItems.map(renderCartItem)}
          </ScrollView>

          {/* Summary */}
          <View style={cartStyles.summary}>
            <View style={cartStyles.summaryRow}>
              <Text style={cartStyles.summaryLabel}>Subtotal:</Text>
              <Text style={cartStyles.summaryValue}>${calculateTotal().toLocaleString()}</Text>
            </View>
            
            <View style={cartStyles.summaryDivider} />
            
            <View style={cartStyles.summaryRow}>
              <Text style={cartStyles.totalLabel}>Total:</Text>
              <Text style={cartStyles.totalValue}>${calculateTotal().toLocaleString()}</Text>
            </View>

            <TouchableOpacity
              style={cartStyles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={cartStyles.checkoutButtonText}>Proceder al pago</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      {renderDeleteDialog()}
    </SafeAreaView>
  );
};

export default CartScreen;