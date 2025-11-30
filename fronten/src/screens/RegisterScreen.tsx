import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { authService } from '../services/api';

export default function RegisterScreen({ navigation }: any) {
  type FormFields = {
    tipoDocumento: string;
    numeroDocumento: string;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    confirmPassword: string;
    telefono: string;
    direccion: string;
  };
  const [formData, setFormData] = useState<FormFields>({
    tipoDocumento: '',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    setError('');
    // Validaciones
    if (formData.tipoDocumento === '') {
      setError('Selecciona un tipo de documento');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    const required: (keyof FormFields)[] = ['numeroDocumento', 'tipoDocumento', 'nombre', 'apellido', 'email', 'telefono', 'direccion'];
    for (const key of required) {
      if (!formData[key] || String(formData[key]).trim() === '') {
        setError('Por favor completa todos los campos obligatorios');
        return;
      }
    }
    setLoading(true);
    // Mapear nombres al payload que espera el backend: correo en lugar de email
    const { confirmPassword, email, ...rest } = formData;
    const payload = {
      ...rest,
      correo: email
    };
    console.log('Payload de registro:', payload);
    try {
      // Usar authService.register para registrar
      const result = await authService.register(payload);
      setLoading(false);
      console.log('Respuesta registro:', result);
      if (result.success) {
        alert('¡Registro exitoso! Por favor inicia sesión.');
        navigation.replace('Login');
      } else {
        setError(result.error || 'Error en el registro');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.message || err?.message || 'Error de conexión');
      console.log('Error registro:', err?.response?.data || err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 80}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.label}>Tipo de Documento *</Text>
      <View style={styles.input}>
        <Picker
          selectedValue={formData.tipoDocumento}
          onValueChange={v => handleChange('tipoDocumento', v)}
        >
          <Picker.Item label="Seleccione un tipo de documento" value="" />
          <Picker.Item label="Cédula" value="CEDULA" />
          <Picker.Item label="Pasaporte" value="PASAPORTE" />
          <Picker.Item label="Cédula de Extranjería" value="CEDULA_EXTRANJERIA" />
        </Picker>
      </View>
      <Text style={styles.label}>Número de Documento *</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de documento"
        value={formData.numeroDocumento}
        onChangeText={v => handleChange('numeroDocumento', v)}
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={formData.nombre}
        onChangeText={v => handleChange('nombre', v)}
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Apellido *</Text>
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={formData.apellido}
        onChangeText={v => handleChange('apellido', v)}
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={v => handleChange('email', v)}
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Teléfono *</Text>
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={formData.telefono}
        onChangeText={v => handleChange('telefono', v)}
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Dirección *</Text>
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={formData.direccion}
        onChangeText={v => handleChange('direccion', v)}
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Contraseña *</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Contraseña"
          value={formData.password}
          onChangeText={v => handleChange('password', v)}
          secureTextEntry={!showPassword}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.toggleButton} onPress={() => setShowPassword(prev => !prev)}>
          <Text style={styles.toggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Confirmar Contraseña *</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChangeText={v => handleChange('confirmPassword', v)}
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.toggleButton} onPress={() => setShowConfirmPassword(prev => !prev)}>
          <Text style={styles.toggleText}>{showConfirmPassword ? 'Ocultar' : 'Mostrar'}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#28a745',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputFlex: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  toggleButton: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  toggleText: {
    color: '#28a745',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // elevation for Android
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  link: {
    color: '#28a745',
    marginTop: 8,
    fontSize: 16,
  },
  inputPlaceholder: {
    color: '#888'
  },
});