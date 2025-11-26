import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { productService } from '../services/api';
import { Colors, Typography, Spacing, Border, Shadows } from '../styles/GlobalStyles';

export default function CreateProductScreen({ navigation }: any) {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'ELECTRONICA',
    estado: 'DISPONIBLE',
  });
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const categories = [
    { label: 'Electrónica', value: 'ELECTRONICA' },
    { label: 'Ropa', value: 'ROPA' },
    { label: 'Hogar', value: 'HOGAR' },
    { label: 'Deportes', value: 'DEPORTES' },
    { label: 'Libros', value: 'LIBROS' },
    { label: 'Otros', value: 'OTROS' },
  ];

  const estados = [
    { label: 'Disponible', value: 'DISPONIBLE' },
    { label: 'Agotado', value: 'AGOTADO' },
    { label: 'Descontinuado', value: 'DESCONTINUADO' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es requerido');
      return false;
    }
    if (!formData.descripcion.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return false;
    }
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Error', 'El stock debe ser mayor o igual a 0');
      return false;
    }
    return true;
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
      };

      await productService.createProduct(productData, token);
      
      Alert.alert(
        'Éxito',
        'Producto creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Producto</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Nombre del producto */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre del Producto *</Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'nombre' && styles.inputWrapperFocused
            ]}>
              <Text style={styles.inputIcon}>📦</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: iPhone 15 Pro"
                value={formData.nombre}
                onChangeText={(value) => handleInputChange('nombre', value)}
                onFocus={() => setFocusedInput('nombre')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción *</Text>
            <View style={[
              styles.inputWrapper,
              styles.textAreaWrapper,
              focusedInput === 'descripcion' && styles.inputWrapperFocused
            ]}>
              <Text style={[styles.inputIcon, styles.textAreaIcon]}>📝</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe las características del producto..."
                value={formData.descripcion}
                onChangeText={(value) => handleInputChange('descripcion', value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onFocus={() => setFocusedInput('descripcion')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Precio y Stock */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Precio *</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'precio' && styles.inputWrapperFocused
              ]}>
                <Text style={styles.inputIcon}>💰</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={formData.precio}
                  onChangeText={(value) => handleInputChange('precio', value)}
                  keyboardType="numeric"
                  onFocus={() => setFocusedInput('precio')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Stock *</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'stock' && styles.inputWrapperFocused
              ]}>
                <Text style={styles.inputIcon}>📊</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={formData.stock}
                  onChangeText={(value) => handleInputChange('stock', value)}
                  keyboardType="numeric"
                  onFocus={() => setFocusedInput('stock')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Categoría */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerIcon}>🏷️</Text>
              <Picker
                selectedValue={formData.categoria}
                onValueChange={(value) => handleInputChange('categoria', value)}
                style={styles.picker}
                enabled={!loading}
              >
                {categories.map((cat) => (
                  <Picker.Item
                    key={cat.value}
                    label={cat.label}
                    value={cat.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Estado */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerIcon}>🔄</Text>
              <Picker
                selectedValue={formData.estado}
                onValueChange={(value) => handleInputChange('estado', value)}
                style={styles.picker}
                enabled={!loading}
              >
                {estados.map((estado) => (
                  <Picker.Item
                    key={estado.value}
                    label={estado.label}
                    value={estado.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Botón de crear */}
          <TouchableOpacity
            style={[
              styles.createButton,
              loading && styles.createButtonDisabled
            ]}
            onPress={handleCreateProduct}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={styles.loadingText}>Creando producto...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.createIcon}>✨</Text>
                <Text style={styles.createButtonText}>Crear Producto</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.light,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: Border.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backIcon: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.xl,
    padding: Spacing.xl,
    marginVertical: Spacing.lg,
    ...Shadows.medium,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.lightGray,
    borderWidth: Border.width.thin,
    borderColor: Colors.border,
    borderRadius: Border.radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    borderWidth: Border.width.normal,
    backgroundColor: Colors.white,
  },
  textAreaWrapper: {
    alignItems: 'flex-start' as const,
  },
  inputIcon: {
    fontSize: Typography.fontSize.lg,
    color: Colors.gray,
    marginRight: Spacing.sm,
  },
  textAreaIcon: {
    marginTop: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  textArea: {
    minHeight: 80,
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  halfWidth: {
    width: '48%' as const,
  },
  pickerWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.lightGray,
    borderWidth: Border.width.thin,
    borderColor: Colors.border,
    borderRadius: Border.radius.lg,
    paddingHorizontal: Spacing.md,
  },
  pickerIcon: {
    fontSize: Typography.fontSize.lg,
    color: Colors.gray,
    marginRight: Spacing.sm,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: Border.radius.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: Spacing.lg,
    ...Shadows.medium,
  },
  createButtonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.6,
  },
  createIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.sm,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  loadingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    color: Colors.white,
    fontSize: Typography.fontSize.md,
    marginLeft: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
};