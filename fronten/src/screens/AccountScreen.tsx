import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, userService } from '../services/api';
import { Picker } from '@react-native-picker/picker';

const AccountScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [apellido, setApellido] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await authService.getCurrentUser();
      setUser(u);
      if (u) {
        // diferentes formas según estructura almacenada
        const doc = u.numeroDocumento || u.documento || u.usuario?.numeroDocumento || u.user?.numeroDocumento || '';
        setNumeroDocumento(doc);
        setTipoDocumento(u.tipoDocumento || u.usuario?.tipoDocumento || 'Pasaporte');
        setApellido(u.apellido || u.usuario?.apellido || '');
        setNombreCompleto(u.nombre || u.usuario?.nombre || u.nombreCompleto || '');
        setEmail(u.correo || u.email || u.usuario?.correo || '');
        setTelefono(u.telefono || u.usuario?.telefono || '');
        setDireccion(u.direccion || u.usuario?.direccion || '');
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente');
    navigation.replace('Home');
  };

  const handleSave = async () => {
    if (!user) return Alert.alert('Error', 'Usuario no cargado');
    // El backend requiere correo y password en la validación; pedimos la contraseña actual
    if (!confirmPassword) return Alert.alert('Confirma contraseña', 'Debes ingresar tu contraseña actual para guardar los cambios');

    const payload: any = {
      tipoDocumento,
      nombre: nombreCompleto,
      apellido,
      telefono,
      direccion,
      correo: email,
      // enviamos la contraseña actual en el campo `password` para que el backend la valide/acepte
      password: confirmPassword,
    };

    // Determinar documento para la ruta
    const doc = numeroDocumento || user.numeroDocumento || user.documento || user.usuario?.numeroDocumento || user.user?.numeroDocumento;
    if (!doc) return Alert.alert('Error', 'No se pudo determinar el número de documento del usuario');

    try {
      setSaving(true);
      console.log('AccountScreen: enviando PUT /usuarios/', doc, payload);
      await userService.update(doc, payload);
      Alert.alert('Hecho', 'Datos actualizados correctamente');

      // refrescar copia local del usuario (sin tocar token)
      try {
        const res = await userService.getById(doc);
        if (res?.data) {
          const stored = await authService.getCurrentUser();
          const newStored = { ...stored, ...res.data };
          await AsyncStorage.setItem('user', JSON.stringify(newStored));
          setUser(newStored);
        }
      } catch (refreshErr) {
        console.warn('No se pudo actualizar usuario localmente', refreshErr);
      }
    } catch (err: any) {
      console.error('update user error', err);
      console.log('err.message', err?.message);
      console.log('err.request', err?.request);
      console.log('err.request._response (raw server response)', err?.request?._response);
      console.log('err.response', err?.response);
      const serverData = err?.response?.data;
      const serverMsg = serverData?.message || (serverData && JSON.stringify(serverData)) || null;
      Alert.alert('Error', serverMsg || err?.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Mi Cuenta</Text>
          {user ? (
            <>
              <Text style={styles.label}>Número de Documento</Text>
              <TextInput style={[styles.input, { backgroundColor: '#e6eef5' }]} value={numeroDocumento} editable={false} />

              <Text style={styles.label}>Tipo de Documento</Text>
              <View style={styles.pickerWrap}>
                <Picker selectedValue={tipoDocumento} onValueChange={(v) => setTipoDocumento(String(v))}>
                  <Picker.Item label="Cédula" value="Cedula" />
                  <Picker.Item label="Pasaporte" value="Pasaporte" />
                  <Picker.Item label="Documento Extranjero" value="Otro" />
                </Picker>
              </View>

              <Text style={styles.label}>Apellido</Text>
              <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />

              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput style={styles.input} value={nombreCompleto} onChangeText={setNombreCompleto} />

              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

              <Text style={styles.hint}>Confirma con tu contraseña actual *</Text>
              <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Ingresa tu contraseña actual" secureTextEntry />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />

              <Text style={styles.label}>Dirección</Text>
              <TextInput style={[styles.input, { height: 70 }]} value={direccion} onChangeText={setDireccion} multiline />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
              </TouchableOpacity>

              <View style={{ marginTop: 14 }}>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CreateProduct')}>
                  <Text style={styles.primaryText}>Publicar producto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 10 }]} onPress={handleLogout}>
                  <Text style={styles.secondaryText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text>Cargando datos...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, backgroundColor: '#f8fafc', flexGrow: 1 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  title: { fontSize: 22, fontWeight: '800', color: '#16a34a', marginBottom: 12 },
  label: { fontSize: 13, color: '#64748b', marginTop: 8 },
  value: { fontSize: 16, color: '#0f172a', fontWeight: '600' },
  actions: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap' },
  primaryBtn: { backgroundColor: '#22c55e', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginRight: 8, flex: 1, marginBottom: 8 },
  primaryText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  secondaryBtn: { backgroundColor: '#ef4444', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, flex: 1 },
  secondaryText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  input: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6 },
  pickerWrap: { backgroundColor: '#f1f5f9', borderRadius: 8, marginTop: 6 },
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
  saveBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, marginTop: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});

export default AccountScreen;
