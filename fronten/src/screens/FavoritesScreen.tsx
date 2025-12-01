import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFullUrl } from '../services/api';
import { useIsFocused } from '@react-navigation/native';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl?: string;
  fechaPublicacion?: string;
}

const FAVORITES_KEY = '@comuctiva_favorites_v1';

const FavoritesScreen = ({ navigation }: any) => {
  const [favorites, setFavorites] = useState<Producto[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) loadFavorites();
  }, [isFocused]);

  const loadFavorites = async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw));
      else setFavorites([]);
    } catch (e) {
      console.warn('Error cargando favoritos', e);
    }
  };

  const removeFavorite = async (id: number) => {
    try {
      const next = favorites.filter(f => f.id !== id);
      setFavorites(next);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Error eliminando favorito', e);
    }
  };

  const renderItem = ({ item }: { item: Producto }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        {item.imagenUrl ? (
          <Image source={{ uri: getFullUrl(item.imagenUrl) }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.nombre}</Text>
          <Text style={styles.price}>${item.precio.toLocaleString()}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.addToCartButton}>
              <Text style={styles.addToCartText}>Agregar al carrito</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeFavorite(item.id)}>
              <Text style={styles.removeText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No tienes favoritos todavía</Text>
          <Text>Marca productos con el corazón para agregarlos aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', gap: 12 },
  image: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#e2e8f0' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  price: { fontSize: 14, fontWeight: '700', color: '#22c55e', marginTop: 6 },
  actionsRow: { flexDirection: 'row', marginTop: 10, gap: 8, alignItems: 'center' },
  addToCartButton: { backgroundColor: '#22c55e', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  addToCartText: { color: '#fff', fontWeight: '600' },
  removeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e11d48', marginLeft: 8 },
  removeText: { color: '#e11d48', fontWeight: '600' },
});

export default FavoritesScreen;
