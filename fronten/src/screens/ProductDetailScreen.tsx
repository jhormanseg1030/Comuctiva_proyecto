import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { productService } from '../services/api';
import { getFullUrl } from '../services/api';

const ProductDetailScreen = () => {
  const route = useRoute();
  const { id } = route.params as { id: number };
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productService.getById(id)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('No se pudo cargar el producto');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (error) {
    return <View style={styles.center}><Text>{error}</Text></View>;
  }

  if (!product) {
    return <View style={styles.center}><Text>Producto no encontrado</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.infoBox}>
        {/* Mostrar imagen principal dentro de la card */}
        <View style={styles.imageBox}>
          {(product.imagenUrl || product.imagen) && (
            <Image source={{ uri: getFullUrl(product.imagenUrl || product.imagen) }} style={styles.image} />
          )}
          {Array.isArray(product.imagenes) && product.imagenes.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryBox}>
              {product.imagenes.map((img: string, idx: number) => (
                <Image key={idx} source={{ uri: getFullUrl(img) }} style={styles.galleryImage} />
              ))}
            </ScrollView>
          )}
        </View>
        <Text style={styles.title}>{product.nombre}</Text>
        <Text style={styles.price}>${product.precio?.toLocaleString()}</Text>
        <Text style={styles.description}>{product.descripcion}</Text>
        {product.stock !== undefined && (
          <Text style={styles.stock}>Stock disponible: <Text style={{ fontWeight: 'bold' }}>{product.stock}</Text> unidades</Text>
        )}
        {product.especificaciones && (
          <View style={styles.specsBox}>
            <Text style={styles.specsTitle}>Especificaciones:</Text>
            <Text style={styles.specs}>{product.especificaciones}</Text>
          </View>
        )}
        <View style={styles.cartRow}>
          <Text style={styles.cantidadLabel}>Cantidad:</Text>
          <View style={styles.cantidadBox}>
            <Text style={styles.cantidadBtn}>-</Text>
            <Text style={styles.cantidadValue}>1</Text>
            <Text style={styles.cantidadBtn}>+</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartButtonText}>🛒 Agregar al carrito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  imageBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 320,
    height: 220,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  galleryBox: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#22c55e',
    textAlign: 'left',
  },
  price: {
    fontSize: 22,
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  stock: {
    fontSize: 15,
    marginBottom: 10,
    color: '#15803d',
  },
  specsBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  specsTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specs: {
    fontSize: 15,
    color: '#555',
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  cantidadLabel: {
    fontSize: 15,
    marginRight: 8,
  },
  cantidadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cantidadBtn: {
    fontSize: 18,
    color: '#22c55e',
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
  cantidadValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  cartButton: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default ProductDetailScreen;
