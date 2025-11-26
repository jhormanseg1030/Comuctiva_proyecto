import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { authService } from '../services/api';
import { loginStyles } from '../styles/LoginStyles';
import { Colors } from '../styles/GlobalStyles';

export default function LoginScreen({ navigation }: any) {
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!numeroDocumento || !password) {
      setError('Por favor ingrese número de documento y contraseña');
      return;
    }
    setLoading(true);
    setError('');
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      // Timeout de 10 segundos para evitar quedarse cargando indefinidamente
      const loginPromise = authService.login(numeroDocumento, password);
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Tiempo de espera agotado. Verifica tu conexión o el servidor.')), 10000);
      });
      const response = await Promise.race([loginPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      // Verifica que la respuesta tenga el token
      if (!response || !response.token) {
        setError('No se recibió el token. Verifica las credenciales o el servidor.');
        return;
      }
      navigation.replace('Home');
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      // Muestra el mensaje exacto del backend o error de red
      const backendMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Error de red o credenciales inválidas';
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={loginStyles.container}>
      <ScrollView 
        contentContainerStyle={loginStyles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header con logo y título
        <View style={loginStyles.headerContainer}>
          <View style={loginStyles.logoContainer}>
            <Text style={loginStyles.logoIcon}>🏢</Text>
          </View>
          <Text style={loginStyles.appTitle}>Sistema de Gestión</Text>
          <Text style={loginStyles.appSubtitle}>Administración empresarial</Text>
        </View> */}

        {/* Formulario de login */}
        <View style={loginStyles.formContainer}>
          <Text style={loginStyles.formTitle}>Iniciar Sesión</Text>
          
          {/* Error message */}
          {error ? (
            <View style={loginStyles.errorContainer}>
              <Text style={loginStyles.errorIcon}>⚠️</Text>
              <Text style={loginStyles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          {/* Campo de número de documento */}
          <View style={loginStyles.inputContainer}>
            <Text style={loginStyles.inputLabel}>Número de Documento</Text>
            <View style={[
              loginStyles.inputWrapper,
              focusedInput === 'numeroDocumento' && loginStyles.inputWrapperFocused
            ]}>
              <Text style={loginStyles.inputIcon}>🆔</Text>
              <TextInput
                style={loginStyles.input}
                placeholder="Ingrese su número de documento"
                value={numeroDocumento}
                onChangeText={setNumeroDocumento}
                onFocus={() => setFocusedInput('numeroDocumento')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>
          
          {/* Campo de contraseña */}
          <View style={loginStyles.inputContainer}>
            <Text style={loginStyles.inputLabel}>Contraseña</Text>
            <View style={[
              loginStyles.inputWrapper,
              focusedInput === 'password' && loginStyles.inputWrapperFocused
            ]}>
              <Text style={loginStyles.inputIcon}>🔒</Text>
              <TextInput
                style={loginStyles.input}
                placeholder="Ingrese su contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>
          </View>
          
          {/* Botón de login */}
          <View style={loginStyles.buttonContainer}>
            <TouchableOpacity 
              style={[
                loginStyles.loginButton,
                loading && loginStyles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={loginStyles.loadingContainer}>
                  <ActivityIndicator color={Colors.white} size="small" />
                  <Text style={loginStyles.loadingText}>Iniciando sesión...</Text>
                </View>
              ) : (
                <Text style={loginStyles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Credenciales de prueba */}
        {/* <View style={loginStyles.credentialsContainer}>
          <Text style={loginStyles.credentialsTitle}>🔑 Credenciales de prueba</Text>
          <Text style={loginStyles.credentialsText}>
            Admin: admin / admin123{'\n'}
            Coordinador: coordinador / coord123
          </Text>
        </View> */}

        {/* Footer */}
        {/* <View style={loginStyles.footerContainer}>
          <Text style={loginStyles.footerText}>
            © 2025 Sistema de Gestión{'\n'}
            Versión 1.0.0
          </Text>
        </View> */}
      </ScrollView>
    </View>
  );
}
