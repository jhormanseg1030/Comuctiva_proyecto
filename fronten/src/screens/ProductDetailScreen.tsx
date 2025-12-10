import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { productService, cartService, comentarioService } from '../services/api';
import { getFullUrl } from '../services/api';
import { authService } from '../services/api';

const ProductDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params as { id: number };
  const isLoggedIn = route?.params?.isLoggedIn || false;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successType, setSuccessType] = useState<'cart' | 'comment'>('cart');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Estados para comentarios
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [comentariosLoading, setComentariosLoading] = useState(true);
  const [comentariosError, setComentariosError] = useState<string | null>(null);
  const [promedioCalificacion, setPromedioCalificacion] = useState<number>(0);
  const [totalComentarios, setTotalComentarios] = useState<number>(0);
  const [miComentario, setMiComentario] = useState<any | null>(null);
  
  // Estados para el formulario de nuevo comentario
  const [showComentarioModal, setShowComentarioModal] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [editandoComentario, setEditandoComentario] = useState(false);

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
    cargarComentarios();
  }, [id]);

  const cargarComentarios = async () => {
    setComentariosLoading(true);
    try {
      const res = await comentarioService.getComentariosByProducto(id);
      console.log('Comentarios recibidos:', res.data);
      setComentarios(res.data.comentarios || []);
      setPromedioCalificacion(res.data.promedioCalificacion || 0);
      setTotalComentarios(res.data.totalComentarios || 0);
      
      // Buscar mi comentario si estoy logueado
      if (isLoggedIn) {
        const user = await authService.getCurrentUser();
        if (user) {
          const miComent = (res.data.comentarios || []).find(
            (c: any) => c.usuarioDocumento === user.numeroDocumento
          );
          setMiComentario(miComent || null);
          console.log('Mi comentario encontrado:', miComent);
        }
      }
      setComentariosLoading(false);
    } catch (err: any) {
      console.log('Error al obtener comentarios:', err?.response?.data || err.message || err);
      setComentariosError('No se pudieron cargar los comentarios');
      setComentariosLoading(false);
    }
  };

  const handleAddToCart = async () => {
    console.log('🛒 Intentando agregar al carrito:', product?.nombre, 'Cantidad:', cantidad, 'Logueado:', isLoggedIn);

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setAddingToCart(true);
    try {
      const response = await cartService.addToCart(product.id, cantidad);
      console.log('✅ Producto agregado:', response?.data);
      setSuccessMessage(`${product.nombre}`);
      setSuccessType('cart');
      setShowSuccessModal(true);
      setCantidad(1); // Reset cantidad
      // Auto cerrar después de 3 segundos
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error: any) {
      console.error('❌ Error:', error);
      const errorMessage = error?.response?.data?.message || 'Error al agregar al carrito';
      Alert.alert('❌ Error', errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementarCantidad = () => {
    if (cantidad < (product?.stock || 0)) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const handleAbrirComentarioModal = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    // Si ya tiene un comentario, cargar datos para editar
    if (miComentario) {
      setEditandoComentario(true);
      setNuevoComentario(miComentario.comentario);
      setCalificacion(miComentario.calificacion);
    } else {
      setEditandoComentario(false);
      setNuevoComentario('');
      setCalificacion(5);
    }
    
    setShowComentarioModal(true);
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario');
      return;
    }

    setEnviandoComentario(true);
    try {
      if (editandoComentario && miComentario) {
        // Editar comentario existente
        await comentarioService.actualizarComentario(
          miComentario.id,
          nuevoComentario,
          calificacion
        );
        setSuccessMessage('Tu opinión ha sido actualizada');
        setSuccessType('comment');
      } else {
        // Crear nuevo comentario
        await comentarioService.crearComentario({
          productoId: id,
          comentario: nuevoComentario,
          calificacion: calificacion,
        });
        setSuccessMessage('Tu opinión ha sido publicada');
        setSuccessType('comment');
      }
      
      setShowSuccessModal(true);
      setShowComentarioModal(false);
      setNuevoComentario('');
      setCalificacion(5);
      setEditandoComentario(false);
      
      // Recargar comentarios
      cargarComentarios();
      
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error: any) {
      console.error('❌ Error al guardar comentario:', error);
      const errorMessage = error?.response?.data?.message || 'Error al guardar el comentario';
      Alert.alert('❌ Error', errorMessage);
    } finally {
      setEnviandoComentario(false);
    }
  };

  const handleEliminarComentario = () => {
    if (!miComentario) return;
    
    Alert.alert(
      '¿Eliminar comentario?',
      '¿Estás seguro de que deseas eliminar tu comentario? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await comentarioService.eliminarComentario(miComentario.id);
              setSuccessMessage('Tu opinión ha sido eliminada');
              setSuccessType('comment');
              setShowSuccessModal(true);
              setMiComentario(null);
              cargarComentarios();
              setTimeout(() => setShowSuccessModal(false), 3000);
            } catch (error: any) {
              console.error('❌ Error al eliminar comentario:', error);
              const errorMessage = error?.response?.data?.message || 'Error al eliminar el comentario';
              Alert.alert('❌ Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderEstrellas = (calificacionVal: number, onPress?: (value: number) => void) => {
    return (
      <View style={styles.estrellasContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Text style={styles.estrella}>
              {star <= calificacionVal ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
            <TouchableOpacity onPress={decrementarCantidad}>
              <Text style={styles.cantidadBtn}>-</Text>
            </TouchableOpacity>
            <Text style={styles.cantidadValue}>{cantidad}</Text>
            <TouchableOpacity onPress={incrementarCantidad}>
              <Text style={styles.cantidadBtn}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.cartButton, (addingToCart || product?.stock === 0) && styles.cartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart || product?.stock === 0}
        >
          <Text style={styles.cartButtonText}>
            {addingToCart ? '⏳ Agregando...' : '🛒 Agregar al carrito'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sección de Comentarios */}
      <View style={styles.comentariosSection}>
        <View style={styles.comentariosHeaderBox}>
          <View style={styles.comentariosHeaderContent}>
            <Text style={styles.comentariosTitulo}>💬 Comentarios</Text>
            {totalComentarios > 0 && (
              <View style={styles.promedioBox}>
                <View style={styles.estrellaPromedioBox}>
                  <Text style={styles.promedioTexto}>{promedioCalificacion.toFixed(1)}</Text>
                  <Text style={styles.estrellaIcon}>⭐</Text>
                </View>
                <Text style={styles.totalComentariosTexto}>{totalComentarios} {totalComentarios === 1 ? 'comentario' : 'comentarios'}</Text>
              </View>
            )}
          </View>
        </View>

        {miComentario ? (
          // Si ya tiene un comentario, mostrar botones de editar/eliminar
          <View style={styles.botonesComentarioContainer}>
            <TouchableOpacity 
              style={styles.editarComentarioBtn}
              onPress={handleAbrirComentarioModal}
            >
              <Text style={styles.editarComentarioBtnText}>✏️ Editar mi opinión</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.eliminarComentarioBtn}
              onPress={handleEliminarComentario}
            >
              <Text style={styles.eliminarComentarioBtnText}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Si no tiene comentario, mostrar botón de agregar
          <TouchableOpacity 
            style={styles.agregarComentarioBtn}
            onPress={handleAbrirComentarioModal}
          >
            <Text style={styles.agregarComentarioBtnText}>💬 Agregar mi opinión</Text>
          </TouchableOpacity>
        )}

        {comentariosLoading ? (
          <ActivityIndicator size="small" style={{ marginTop: 16 }} />
        ) : comentariosError ? (
          <Text style={styles.errorText}>{comentariosError}</Text>
        ) : comentarios.length === 0 ? (
          <Text style={styles.sinComentariosText}>Aún no hay opiniones. ¡Sé el primero en comentar!</Text>
        ) : (
          <View style={styles.comentariosList}>
            {comentarios.map((comentario: any, index: number) => {
              const esMiComentario = miComentario && comentario.id === miComentario.id;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.comentarioCard, 
                    esMiComentario && styles.miComentarioCard
                  ]}
                >
                  <View style={styles.comentarioHeader}>
                    <View style={styles.comentarioUsuarioContainer}>
                      <Text style={styles.comentarioUsuario}>
                        {comentario.usuarioNombre || 'Usuario'}
                      </Text>
                      {esMiComentario && (
                        <View style={styles.miComentarioBadge}>
                          <Text style={styles.miComentarioBadgeText}>Tu opinión</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.estrellasWrapper}>
                      {renderEstrellas(comentario.calificacion)}
                    </View>
                  </View>
                  <Text style={styles.comentarioTexto}>{comentario.comentario}</Text>
                  <Text style={styles.comentarioFecha}>
                    {new Date(comentario.fecha).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Modal para agregar comentario */}
      <Modal visible={showComentarioModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.comentarioModalContent}>
            <View style={styles.modalIconHeader}>
              <View style={styles.modalIconCircle}>
                <Text style={styles.modalIconEmoji}>{editandoComentario ? '✏️' : '💬'}</Text>
              </View>
            </View>
            <Text style={styles.modalTitle}>
              {editandoComentario ? 'Editar tu opinión' : '¡Cuéntanos tu experiencia!'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {editandoComentario ? 'Modifica tu reseña cuando quieras' : 'Tu opinión es muy valiosa para nosotros'}
            </Text>
            
            <View style={styles.calificacionSection}>
              <Text style={styles.calificacionLabel}>¿Cómo lo calificas?</Text>
              {renderEstrellas(calificacion, setCalificacion)}
            </View>

            <Text style={styles.comentarioLabel}>Comparte tu experiencia</Text>
            <TextInput
              style={styles.comentarioInput}
              placeholder="Comparte tu experiencia con este producto..."
              value={nuevoComentario}
              onChangeText={setNuevoComentario}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowComentarioModal(false);
                  setNuevoComentario('');
                  setCalificacion(5);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, enviandoComentario && styles.modalButtonDisabled]}
                onPress={handleEnviarComentario}
                disabled={enviandoComentario}
              >
                <Text style={styles.modalButtonText}>
                  {enviandoComentario ? '⏳ Enviando...' : 'Publicar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de éxito personalizado */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {successType === 'cart' ? (
              <>
                <View style={styles.successIconCart}>
                  <Text style={styles.iconText}>🛒</Text>
                </View>
                <Text style={styles.modalTitle}>Agregado al carrito</Text>
                <Text style={styles.modalMessage}>{successMessage}</Text>
                <Text style={styles.modalSubMessage}>Ya está listo para tu compra</Text>
              </>
            ) : (
              <>
                <View style={styles.successIconComment}>
                  <Text style={styles.iconText}>💬</Text>
                </View>
                <Text style={styles.modalTitle}>Gracias por tu opinión</Text>
                <Text style={styles.modalMessage}>{successMessage}</Text>
                <Text style={styles.modalSubMessage}>Tu feedback nos ayuda a mejorar</Text>
              </>
            )}
            <TouchableOpacity 
              style={[styles.modalButton, successType === 'comment' && styles.modalButtonComment]}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de login personalizado */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.loginIcon}>
              <Text style={styles.loginIconText}>🔐</Text>
            </View>
            <Text style={styles.modalTitle}>Debes iniciar sesión</Text>
            <Text style={styles.modalMessage}>Inicia sesión para agregar productos al carrito</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowLoginModal(false);
                  navigation.navigate('Login' as never);
                }}
              >
                <Text style={styles.modalButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    color: '#10b981',
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
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
  cartButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    width: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 14,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconCart: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  successIconComment: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  iconText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 22,
    fontWeight: '500',
  },
  modalSubMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  modalButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonComment: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loginIcon: {
    width: 85,
    height: 85,
    borderRadius: 42,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  loginIconText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
  // Estilos para comentarios
  comentariosSection: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  comentariosHeaderBox: {
    marginBottom: 20,
  },
  comentariosHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comentariosTitulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  promedioBox: {
    alignItems: 'flex-end',
  },
  estrellaPromedioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginBottom: 4,
  },
  promedioTexto: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f59e0b',
  },
  estrellaIcon: {
    fontSize: 16,
  },
  totalComentariosTexto: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  agregarComentarioBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  agregarComentarioBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  botonesComentarioContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  editarComentarioBtn: {
    flex: 1,
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  editarComentarioBtnText: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '700',
  },
  eliminarComentarioBtn: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  eliminarComentarioBtnText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
  comentariosList: {
    marginTop: 4,
  },
  comentarioCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  miComentarioCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    borderWidth: 2,
    shadowColor: '#10b981',
    shadowOpacity: 0.1,
  },
  comentarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  comentarioUsuarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  estrellasWrapper: {
    flexShrink: 0,
  },
  comentarioUsuario: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  miComentarioBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  miComentarioBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  comentarioTexto: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  comentarioFecha: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sinComentariosText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
  },
  estrellasContainer: {
    flexDirection: 'row',
    gap: 3,
    flexShrink: 0,
  },
  estrella: {
    fontSize: 18,
  },
  comentarioModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
  modalIconHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalIconEmoji: {
    fontSize: 36,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  calificacionSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  calificacionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  comentarioLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  comentarioInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#1f2937',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    minHeight: 110,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
});
export default ProductDetailScreen;
