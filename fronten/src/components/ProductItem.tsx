import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getFullUrl } from '../services/api';

type Props = {
  item: any;
  onEdit?: (item: any) => void;
  onToggleActive?: (item: any) => void;
  onDelete?: (item: any) => void;
};

const ProductItem: React.FC<Props> = ({ item, onEdit, onToggleActive, onDelete }) => {
  const imagePath = item.imagen || item.imagenUrl || item.image || (item.imagenes && item.imagenes[0]?.url) || null;
  const imageUri = imagePath ? getFullUrl(imagePath) : null;

  return (
    <View style={styles.card}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.body}>
        <Text style={styles.title}>{item.nombre || item.titulo || `#${item.id}`}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={() => onEdit && onEdit(item)}>
            <Text style={styles.btnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => onToggleActive && onToggleActive(item)}>
            <Text style={styles.btnText}>{item.activo ? 'Desactivar' : 'Activar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.danger]} onPress={() => onDelete && onDelete(item)}>
            <Text style={[styles.btnText, { color: '#fff' }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', marginBottom: 10, elevation: 1 },
  image: { width: 96, height: 96, backgroundColor: '#f1f5f9' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, padding: 12, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  actions: { flexDirection: 'row' },
  btn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#e6eef0', marginRight: 8 },
  btnText: { color: '#0f172a', fontWeight: '600' },
  danger: { backgroundColor: '#dc2626' },
});

export default ProductItem;
