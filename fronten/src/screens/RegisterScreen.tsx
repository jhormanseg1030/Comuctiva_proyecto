import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
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
    <ScrollView contentContainerStyle={styles.container}>
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
      />
      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={formData.nombre}
        onChangeText={v => handleChange('nombre', v)}
      />
      <Text style={styles.label}>Apellido *</Text>
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={formData.apellido}
        onChangeText={v => handleChange('apellido', v)}
      />
      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={v => handleChange('email', v)}
        keyboardType="email-address"
      />
      <Text style={styles.label}>Teléfono *</Text>
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={formData.telefono}
        onChangeText={v => handleChange('telefono', v)}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Dirección *</Text>
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={formData.direccion}
        onChangeText={v => handleChange('direccion', v)}
      />
      <Text style={styles.label}>Contraseña *</Text>
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={formData.password}
        onChangeText={v => handleChange('password', v)}
        secureTextEntry
      />
      <Text style={styles.label}>Confirmar Contraseña *</Text>
      <TextInput
        style={styles.input}
        placeholder="Repite tu contraseña"
        value={formData.confirmPassword}
        onChangeText={v => handleChange('confirmPassword', v)}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#007bff',
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
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
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
    color: '#007bff',
    marginTop: 8,
    fontSize: 16,
  },
});