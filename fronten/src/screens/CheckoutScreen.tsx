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

const CheckoutScreen = ({ navigation, route }: any) => {
  const { cartItems = [], total = 0 } = route.params || {};
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoEnvio, setTipoEnvio] = useState('tienda');
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculateTotal = () => {
    return total + costoEnvio;
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  const handleConfirmOrder = () => {
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

    Alert.alert(
      '🎉 Pedido Confirmado',
      `¡Gracias ${nombre}! Tu pedido ha sido confirmado.\n\nTotal: $${calculateTotal().toLocaleString()}\n\nRecibirás un email de confirmación en ${email}`,
      [
        {
          text: 'CONTINUAR',
          onPress: async () => {
            // Limpiar carrito después del pedido
            await AsyncStorage.removeItem('cart');
            navigation.navigate('Home');
          }
        }
      ]
    );
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
});

export default CheckoutScreen;
