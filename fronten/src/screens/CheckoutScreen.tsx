import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StyleSheet,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, cartService, pedidosService } from '../services/api';

const CheckoutScreen = ({ navigation, route }: any) => {
  const { cartItems = [], total = 0 } = route.params || {};
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoEnvio, setTipoEnvio] = useState('tienda');
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const calculateTotal = () => {
    return total + costoEnvio;
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  const handleConfirmOrder = async () => {
    if (!nombre.trim()) {
      showError('Por favor ingresa tu nombre completo');
      return;
    }
    if (!email.trim()) {
      showError('Por favor ingresa tu email');
      return;
    }
    if (!direccion.trim() && tipoEnvio !== 'tienda') {
      showError('Por favor ingresa tu dirección de entrega');
      return;
    }

    try {
      // Crear el pedido en el backend
      console.log('🛒 Creando pedido en el backend...');
      
      const pedidoData = {
        direccionEntrega: tipoEnvio === 'tienda' ? 'Recogido en tienda' : direccion,
        metodoPago: metodoPago,
        costoFlete: costoEnvio
      };
      
      console.log('📦 Datos del pedido:', pedidoData);
      
      const response = await pedidosService.crearPedido(pedidoData);
      console.log('✅ Pedido creado exitosamente:', response.data);
      
      // Limpiar el carrito después de crear el pedido
      const isLoggedIn = route?.params?.isLoggedIn;
      if (isLoggedIn) {
        // Si está logueado, limpiar carrito del backend
        await cartService.clearCart();
      } else {
        // Si es invitado, limpiar AsyncStorage
        await AsyncStorage.removeItem('cart');
      }
      
      setShowSuccessDialog(true);
      
    } catch (error: any) {
      console.error('❌ Error creando pedido:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        showError('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        showError(error.response?.data?.message || 'Error al procesar el pedido. Intenta nuevamente.');
      }
    }
  };

  const renderErrorDialog = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showErrorDialog}
      onRequestClose={() => setShowErrorDialog(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxWidth: 350 }]}>
          <View style={styles.modalIcon}>
            <Text style={[styles.modalIconText, { fontSize: 40, color: '#ef4444' }]}>⚠️</Text>
          </View>
          
          <Text style={[styles.modalTitle, { color: '#ef4444', marginTop: 15 }]}>Error</Text>
          <Text style={styles.modalMessage}>{errorMessage}</Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#ef4444' }]}
              onPress={() => setShowErrorDialog(false)}
            >
              <Text style={styles.modalButtonText}>ENTENDIDO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSuccessDialog = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSuccessDialog}
      onRequestClose={() => setShowSuccessDialog(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.successModal]}>
          {/* Icono de éxito animado */}
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          
          {/* Título */}
          <Text style={styles.successTitle}>¡Pedido Confirmado!</Text>
          
          {/* Mensaje personalizado */}
          <Text style={styles.successMessage}>
            ¡Gracias <Text style={styles.boldText}>{nombre}</Text>! Tu pedido ha sido confirmado exitosamente.
          </Text>
          
          {/* Información del pedido */}
          <View style={styles.orderInfo}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Total:</Text>
              <Text style={styles.orderValue}>${calculateTotal().toLocaleString()}</Text>
            </View>
            
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Método de pago:</Text>
              <Text style={styles.orderPayment}>
                {metodoPago === 'efectivo' && '💵 Efectivo'}
                {metodoPago === 'nequi' && '📱 Nequi'}
                {metodoPago === 'daviplata' && '📲 Daviplata'}
              </Text>
            </View>
            
            <View style={styles.orderDivider} />
            
            <Text style={styles.confirmationText}>
              Recibirás un email de confirmación en:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
          
          {/* Botón de acción */}
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={async () => {
              setShowSuccessDialog(false);
              // Limpiar carrito después del pedido
              try {
                const user = await authService.getCurrentUser();
                if (user) {
                  // Usuario logueado: limpiar carrito del backend
                  await cartService.clearCart();
                } else {
                  // Usuario invitado: limpiar carrito local
                  await AsyncStorage.removeItem('cart');
                }
              } catch (cartError) {
                console.warn('Error clearing cart:', cartError);
                // Fallback: limpiar carrito local
                await AsyncStorage.removeItem('cart');
              }
              
              // Obtener datos del usuario para mantener el estado de login
              try {
                const user = await authService.getCurrentUser();
                if (user) {
                  const displayName = user.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : user.numeroDocumento;
                  
                  // Navegar manteniendo el estado de login
                  navigation.navigate('Home', {
                    isLoggedIn: true,
                    userDocument: user.numeroDocumento,
                    userName: displayName
                  });
                } else {
                  // Si no hay usuario, navegar sin login
                  navigation.navigate('Home');
                }
              } catch (error) {
                console.error('Error getting user data:', error);
                navigation.navigate('Home');
              }
            }}
          >
            <Text style={styles.continueButtonText}>CONTINUAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Compra</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información de Entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Entrega</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ingresa tu nombre completo"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {tipoEnvio !== 'tienda' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dirección de Entrega</Text>
              <TextInput
                style={styles.input}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Ingresa tu dirección completa"
                placeholderTextColor="#9ca3af"
                multiline={true}
                numberOfLines={2}
              />
            </View>
          )}
        </View>

        {/* Opciones de Envío */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Costo de Envío *</Text>
          
          <TouchableOpacity
            style={[
              styles.shippingOption,
              tipoEnvio === 'tienda' && styles.shippingOptionSelected
            ]}
            onPress={() => {
              setTipoEnvio('tienda');
              setCostoEnvio(0);
            }}
          >
            <View style={styles.shippingOptionContent}>
              <View style={styles.radioButton}>
                {tipoEnvio === 'tienda' && <View style={styles.radioButtonSelected} />}
              </View>
              <View style={styles.shippingDetails}>
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Recoger en tienda</Text>
                  <Text style={styles.shippingPriceFree}>Gratis</Text>
                </View>
                <Text style={styles.shippingDescription}>Recoge tu pedido en nuestra tienda</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shippingOption,
              tipoEnvio === 'estandar' && styles.shippingOptionSelected
            ]}
            onPress={() => {
              setTipoEnvio('estandar');
              setCostoEnvio(5000);
            }}
          >
            <View style={styles.shippingOptionContent}>
              <View style={styles.radioButton}>
                {tipoEnvio === 'estandar' && <View style={styles.radioButtonSelected} />}
              </View>
              <View style={styles.shippingDetails}>
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Envío Estándar</Text>
                  <Text style={styles.shippingPrice}>$5.000</Text>
                </View>
                <Text style={styles.shippingDescription}>5-7 días hábiles</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shippingOption,
              tipoEnvio === 'express' && styles.shippingOptionSelected
            ]}
            onPress={() => {
              setTipoEnvio('express');
              setCostoEnvio(10000);
            }}
          >
            <View style={styles.shippingOptionContent}>
              <View style={styles.radioButton}>
                {tipoEnvio === 'express' && <View style={styles.radioButtonSelected} />}
              </View>
              <View style={styles.shippingDetails}>
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Envío Express</Text>
                  <Text style={styles.shippingPrice}>$10.000</Text>
                </View>
                <Text style={styles.shippingDescription}>2-3 días hábiles</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Método de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago *</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              metodoPago === 'efectivo' && styles.paymentOptionSelected
            ]}
            onPress={() => setMetodoPago('efectivo')}
          >
            <View style={styles.paymentOptionContent}>
              <View style={styles.radioButton}>
                {metodoPago === 'efectivo' && <View style={styles.radioButtonSelected} />}
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>💵 Efectivo</Text>
                <Text style={styles.paymentDescription}>Pago en efectivo al recibir el pedido</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              metodoPago === 'nequi' && styles.paymentOptionSelected
            ]}
            onPress={() => setMetodoPago('nequi')}
          >
            <View style={styles.paymentOptionContent}>
              <View style={styles.radioButton}>
                {metodoPago === 'nequi' && <View style={styles.radioButtonSelected} />}
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>📱 Nequi</Text>
                <Text style={styles.paymentDescription}>Pago digital con Nequi</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              metodoPago === 'daviplata' && styles.paymentOptionSelected
            ]}
            onPress={() => setMetodoPago('daviplata')}
          >
            <View style={styles.paymentOptionContent}>
              <View style={styles.radioButton}>
                {metodoPago === 'daviplata' && <View style={styles.radioButtonSelected} />}
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>📲 Daviplata</Text>
                <Text style={styles.paymentDescription}>Pago digital con Daviplata</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Resumen del Pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({cartItems.length} productos):</Text>
            <Text style={styles.summaryValue}>${total.toLocaleString()}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${calculateTotal().toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.backToCartButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToCartText}>Volver al carrito</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmOrder}
          >
            <Text style={styles.confirmButtonText}>Confirmar Pedido</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Error Dialog */}
      {renderErrorDialog()}
      
      {/* Success Dialog */}
      {renderSuccessDialog()}
    </SafeAreaView>
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
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  shippingOption: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  shippingOptionSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  shippingOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16a34a',
  },
  shippingDetails: {
    flex: 1,
  },
  shippingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  shippingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  shippingPriceFree: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  shippingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  // Estilos para métodos de pago
  paymentOption: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  paymentOptionSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 20,
  },
  backToCartButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  backToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#16a34a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Estilos para el modal de éxito
  successModal: {
    maxWidth: 380,
    paddingVertical: 30,
    paddingHorizontal: 25,
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#dcfce7',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  successEmoji: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 15,
  },
  successMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#16a34a',
  },
  orderInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  orderValue: {
    fontSize: 20,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  orderPayment: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 15,
  },
  confirmationText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: '#16a34a',
    textAlign: 'center',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default CheckoutScreen;
