import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productService, categoryService, subcategoryService, authService } from '../services/api';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const CreateProductScreen = ({ navigation }: any) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [fechaCosecha, setFechaCosecha] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<any>(null);

  const handleSubmit = async () => {
    if (!nombre || !precio) return Alert.alert('Error', 'Nombre y precio son obligatorios');
    try {
      setLoading(true);
      if (image) {
        // build FormData
        const form = new FormData();
        form.append('nombre', nombre);
        form.append('descripcion', descripcion || '');
        form.append('precio', String(precio));
        form.append('stock', String(stock || '0'));
        if (fechaCosecha) {
          // backend expects ISO yyyy-MM-dd; try to convert if user entered dd/mm/yyyy
          const parts = fechaCosecha.split('/');
          const fechaISO = parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}` : fechaCosecha;
          form.append('fechaCosecha', fechaISO);
        }
        if (categoryId) form.append('categoriaId', String(categoryId));
        if (subcategoryId) form.append('subcategoriaId', String(subcategoryId));
        const u = await authService.getCurrentUser();
        form.append('usuarioDocumento', u?.numeroDocumento || u?.documento || '');

        let localUri = image.uri;
        // On Android the URI sometimes needs the file:// prefix
        if (Platform.OS === 'android' && !localUri.startsWith('file://')) {
          localUri = 'file://' + localUri;
        }
        const filename = image.name || localUri.split('/').pop();
        const match = filename?.match(/\.([0-9a-z]+)$/i);
        const type = match ? `image/${match[1]}` : 'image';
        form.append('imagen', { uri: localUri, name: filename, type } as any);

        await productService.createWithImage(form);
      } else {
        const payload = {
          nombre,
          precio: Number(precio),
          descripcion,
          stock: stock ? Number(stock) : 0,
          imagenUrl: imagenUrl || undefined,
          fechaCosecha: fechaCosecha || undefined,
          categoriaId: categoryId || undefined,
          subcategoriaId: subcategoryId || undefined,
        } as any;
        await productService.create(payload);
      }

      Alert.alert('Producto creado', 'El producto fue creado correctamente');
      navigation.goBack();
    } catch (err: any) {
      console.warn('create product error', err);
      Alert.alert('Error', err?.response?.data?.message || 'No se pudo crear el producto');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos permiso para acceder a tus fotos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = (result as any).assets ? (result as any).assets[0] : result;
      setImage({ uri: asset.uri, name: asset.fileName || asset.uri.split('/').pop() });
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await categoryService.getAll();
        if (res?.data) setCategories(res.data || []);
      } catch (err) {
        console.warn('load categories', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadSubs = async () => {
      if (!categoryId) return setSubcategories([]);
      try {
        const res = await subcategoryService.getByCategory(categoryId);
        if (res?.data) setSubcategories(res.data || []);
      } catch (err) {
        console.warn('load subcategories', err);
      }
    };
    loadSubs();
  }, [categoryId]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Publicar producto</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre del producto" />

            <Text style={styles.label}>Precio</Text>
            <TextInput style={styles.input} value={precio} onChangeText={setPrecio} placeholder="10000" keyboardType="numeric" />

            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, { height: 90 }]} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción" multiline />

            <Text style={styles.label}>Stock</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="10" keyboardType="numeric" />

            <Text style={styles.label}>Fecha de Cosecha</Text>
            <TextInput style={styles.input} value={fechaCosecha} onChangeText={setFechaCosecha} placeholder="dd/mm/aaaa" />

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={categoryId} onValueChange={(v) => setCategoryId(Number(v))}>
                <Picker.Item label="Selecciona una categoría" value={null} />
                {categories.map((c) => (
                  <Picker.Item key={c.id} label={c.name || c.nombre || c.title} value={c.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Subcategoría</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={subcategoryId} onValueChange={(v) => setSubcategoryId(Number(v))}>
                <Picker.Item label="Selecciona una subcategoría" value={null} />
                {subcategories.map((s) => (
                  <Picker.Item key={s.id} label={s.name || s.nombre} value={s.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Imagen</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={[styles.submitBtn, { paddingHorizontal: 12, marginTop: 0, marginRight: 8 }]} onPress={pickImage}>
                <Text style={styles.submitText}>Elegir imagen</Text>
              </TouchableOpacity>
              <TextInput style={[styles.input, { flex: 1 }]} value={imagenUrl} onChangeText={setImagenUrl} placeholder="O pega una URL..." />
            </View>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            ) : null}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'Creando...' : 'Publicar'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, backgroundColor: '#f8fafc', flexGrow: 1, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  title: { fontSize: 20, fontWeight: '800', color: '#16a34a', marginBottom: 12 },
  label: { fontSize: 13, color: '#64748b', marginTop: 8 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6 },
  submitBtn: { backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 10, marginTop: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '800' },
  pickerWrap: { backgroundColor: '#f1f5f9', borderRadius: 8, marginTop: 6 },
  imagePreview: { width: '100%', height: 180, marginTop: 8, borderRadius: 8 },
});

export default CreateProductScreen;
