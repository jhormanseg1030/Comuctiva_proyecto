import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { productService, getFullUrl } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const EditarProductoScreen = ({ route, navigation }: any) => {
  const { producto } = route.params;
  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [precio, setPrecio] = useState(String(producto?.precio || ''));
  const [stock, setStock] = useState(String(producto?.stock || ''));
  const [descripcion, setDescripcion] = useState(producto?.descripcion || '');
  const [imagenUrl, setImagenUrl] = useState(producto?.imagenUrl || '');
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!nombre || !precio || !stock) return Alert.alert('Error', 'Nombre, precio y stock son obligatorios');
    setLoading(true);
    try {
      let payload: any = {
        nombre,
        precio: Number(precio),
        stock: Number(stock),
        descripcion,
      };
      // Si hay imagen nueva, usa FormData
      if (image) {
        const form = new FormData();
        form.append('nombre', nombre);
        form.append('precio', precio);
        form.append('stock', stock);
        form.append('descripcion', descripcion);
        // Para React Native, usa el formato correcto para imágenes
        form.append('imagen', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'producto.jpg',
        } as any);
        await productService.update(producto.id, form);
      } else {
        await productService.update(producto.id, payload);
      }
      Alert.alert('Hecho', 'Producto actualizado correctamente');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Editar producto</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre del producto" />
        <TextInput style={styles.input} value={precio} onChangeText={setPrecio} placeholder="Precio" keyboardType="numeric" />
        <TextInput style={[styles.input, styles.textarea]} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción" multiline />
        <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="Stock" keyboardType="numeric" />
        <TextInput style={styles.input} value={producto.fechaCosecha || ''} placeholder="Fecha de Cosecha" editable={false} />
        {/* Puedes agregar selectores de categoría/subcategoría si lo necesitas */}
        <View style={styles.imageRow}>
          <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
            <Text style={styles.imgBtnText}>Elegir imagen</Text>
          </TouchableOpacity>
          <TextInput style={styles.inputUrl} value={imagenUrl} onChangeText={setImagenUrl} placeholder="O pega una URL..." />
        </View>
        {(image || imagenUrl) && (
          <Image source={{ uri: image?.uri || getFullUrl(imagenUrl) }} style={styles.image} />
        )}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveText}>{loading ? 'Guardando...' : 'Publicar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8fafc', flexGrow: 1 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, marginTop: 18 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#16a34a', marginBottom: 12, textAlign: 'center' },
  input: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8, fontSize: 15 },
  textarea: { height: 60 },
  imageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  imgBtn: { backgroundColor: '#22c55e', borderRadius: 8, padding: 10, alignItems: 'center', marginRight: 8 },
  imgBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  inputUrl: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  image: { width: '100%', height: 160, resizeMode: 'cover', marginTop: 10, borderRadius: 8 },
  saveBtn: { backgroundColor: '#22c55e', borderRadius: 8, padding: 14, marginTop: 18, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 14, marginTop: 10, alignItems: 'center' },
  cancelText: { color: '#64748b', fontWeight: 'bold', fontSize: 16 },
});

export default EditarProductoScreen;
