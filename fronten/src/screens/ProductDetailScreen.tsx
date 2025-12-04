import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { productService } from '../services/api';
import { getFullUrl } from '../services/api';
import { authService } from '../services/api';

const ProductDetailScreen = () => {
  const route = useRoute();
  const { id } = route.params as { id: number };
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [comentariosLoading, setComentariosLoading] = useState(true);
  const [comentariosError, setComentariosError] = useState<string | null>(null);
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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

    // Obtener comentarios del producto
    productService.getComentarios(id)
      .then((res) => {
        console.log('Comentarios recibidos:', res.data); // DEBUG
        setComentarios(res.data.comentarios || []);
        setComentariosLoading(false);
      })
      .catch((err) => {
        console.log('Error al obtener comentarios:', err?.response?.data || err.message || err);
        setComentariosError('No se pudieron cargar los comentarios');
        setComentariosLoading(false);
      });
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      authService.getCurrentUser().then(setUser);
    }, [])
  );

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) {
      setFormError('El comentario no puede estar vacío');
      return;
    }
    setEnviandoComentario(true);
    setFormError(null);
    try {
      // Ajusta el endpoint si es diferente en tu backend
      await productService.crearComentario(id, {
        calificacion: nuevaCalificacion,
        comentario: nuevoComentario,
      });
      // Recargar comentarios
      const res = await productService.getComentarios(id);
      setComentarios(res.data);
      setNuevoComentario('');
      setNuevaCalificacion(5);
    } catch (err) {
      setFormError('No se pudo publicar la reseña');
    }
    setEnviandoComentario(false);
  };

  const handleCancelarComentario = () => {
    setNuevoComentario('');
    setNuevaCalificacion(5);
    setFormError(null);
  };

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

      {/* Comentarios de clientes */}
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Reseñas de Clientes</Text>
        {/* Formulario de nueva reseña solo si está logueado */}
        {user && typeof user.numeroDocumento === 'string' && user.numeroDocumento.trim().length > 0 ? (
          <View style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 18 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Calificación</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNuevaCalificacion(star)}>
                  <Text style={{ fontSize: 28, color: star <= nuevaCalificacion ? '#fbbf24' : '#ddd' }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Comentario</Text>
            <TextInput
              style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, minHeight: 60, marginBottom: 10, borderWidth: 1, borderColor: '#eee' }}
              placeholder="Cuéntanos tu experiencia con este producto..."
              value={nuevoComentario}
              onChangeText={setNuevoComentario}
              multiline
            />
            {formError && <Text style={{ color: 'red', marginBottom: 8 }}>{formError}</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
              <TouchableOpacity
                style={{ backgroundColor: '#22c55e', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18, marginRight: 10 }}
                onPress={handleEnviarComentario}
                disabled={enviandoComentario}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Publicar Reseña</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#e5e7eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 }}
                onPress={handleCancelarComentario}
                disabled={enviandoComentario}
              >
                <Text style={{ color: '#15803d', fontWeight: 'bold', fontSize: 16 }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {/* Lista de comentarios */}
        {comentariosLoading ? (
          <ActivityIndicator size="small" />
        ) : comentariosError ? (
          <Text style={{ color: 'red' }}>{comentariosError}</Text>
        ) : comentarios.length === 0 ? (
          <Text style={{ color: '#555' }}>No hay comentarios para este producto.</Text>
        ) : (
          comentarios.map((comentario, idx) => (
            <View key={idx} style={{ backgroundColor: '#f1f5f9', borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                {comentario.usuarioNombre || 'Usuario'}
              </Text>
              <Text style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: 2 }}>
                {'★'.repeat(comentario.calificacion || 5)}
              </Text>
              <Text style={{ color: '#333', marginBottom: 4 }}>{comentario.comentario}</Text>
              <Text style={{ fontSize: 12, color: '#888' }}>{comentario.fecha ? new Date(comentario.fecha).toLocaleDateString() : ''}</Text>
            </View>
          ))
        )}
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
