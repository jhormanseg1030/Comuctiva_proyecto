import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { productService, purchaseService } from '../services/api';
import { Colors, Typography, Spacing, Border, Shadows } from '../styles/GlobalStyles';

interface PublishedProduct {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  estado: string;
  publicado: boolean;
  fechaPublicacion?: string;
 
  usuarioId?: number; // ID del vendedor
  vendedorNombre?: string; // Nombre del vendedor
}

export default function PublishedProductsScreen({ navigation }: any) {
  const { token, user } = useContext(AuthContext);
  const [products, setProducts] = useState<PublishedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PublishedProduct | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [buyingLoading, setBuyingLoading] = useState(false);

  const loadPublishedProducts = async () => {
    try {
      const data = await productService.getPublishedProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los productos publicados');
      console.error('Error loading published products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPublishedProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPublishedProducts();
  };

  const handleBuyProduct = (product: PublishedProduct) => {
    // Los ADMIN no pueden comprar productos, solo gestionarlos
    if (user?.role === 'ADMIN') {
      Alert.alert(
        'Modo Administrador',
        'Como administrador puedes gestionar productos pero no comprar. ¿Deseas gestionar este producto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Gestionar Producto',
            onPress: () => navigation.navigate('PublishProduct', { product })
          }
        ]
      );
      return;
    }

    // Verificar si el usuario está tratando de comprar su propio producto
    if (product.usuarioId === user?.id) {
      Alert.alert(
        'Producto Propio',
        'Este es tu propio producto. No puedes comprarlo, pero puedes gestionarlo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Gestionar Producto',
            onPress: () => navigation.navigate('PublishProduct', { product })
          }
        ]
      );
      return;
    }

    setSelectedProduct(product);
    setQuantity('1');
    setShowBuyModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct || !token) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0 || qty > selectedProduct.stock) {
      Alert.alert('Error', 'Cantidad inválida');
      return;
    }

    setBuyingLoading(true);
    try {
      await purchaseService.createPurchase(token, {
        productoId: selectedProduct.id,
        cantidad: qty,
        metodoPago: 'Tarjeta de Crédito', // Por simplicidad
      });

      Alert.alert(
        '¡Compra Exitosa!', 
        `Has comprado ${qty} unidad(es) de ${selectedProduct.nombre}`,
        [
          {
            text: 'Ver Mis Compras',
            onPress: () => {
              setShowBuyModal(false);
              navigation.navigate('Purchases');
            }
          },
          {
            text: 'Continuar Comprando',
            onPress: () => setShowBuyModal(false)
          }
        ]
      );
      
      // Recargar productos para actualizar stock
      loadPublishedProducts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo completar la compra');
    } finally {
      setBuyingLoading(false);
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'ELECTRONICA':
        return '📱';
      case 'ROPA':
        return '👕';
      case 'HOGAR':
        return '🏠';
      case 'DEPORTES':
        return '⚽';
      case 'LIBROS':
        return '📚';
      default:
        return '📦';
    }
  };

  const getAvailabilityStatus = (stock: number, estado: string) => {
    if (estado === 'DESCONTINUADO') {
      return { text: 'Descontinuado', color: Colors.error, icon: '🚫' };
    }
    if (stock === 0 || estado === 'AGOTADO') {
      return { text: 'Agotado', color: Colors.warning, icon: '❌' };
    }
    if (stock <= 5) {
      return { text: 'Pocas unidades', color: Colors.warning, icon: '⚠️' };
    }
    return { text: 'Disponible', color: Colors.success, icon: '✅' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Productos Publicados</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando catálogo público...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marketplace ({products.length})</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🌐</Text>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        {user?.role === 'ADMIN' ? (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumber}>
                {new Set(products.map(p => p.usuarioId)).size}
              </Text>
              <Text style={styles.statLabel}>Vendedores</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⚠️</Text>
              <Text style={styles.statNumber}>
                {products.filter(p => p.stock === 0 || p.estado !== 'DISPONIBLE').length}
              </Text>
              <Text style={styles.statLabel}>Revisar</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👤</Text>
              <Text style={styles.statNumber}>
                {products.filter(p => p.usuarioId === user?.id).length}
              </Text>
              <Text style={styles.statLabel}>Tuyos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🛒</Text>
              <Text style={styles.statNumber}>
                {products.filter(p => p.usuarioId !== user?.id && p.stock > 0 && p.estado === 'DISPONIBLE').length}
              </Text>
              <Text style={styles.statLabel}>Comprables</Text>
            </View>
          </>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌐</Text>
            <Text style={styles.emptyTitle}>No hay productos publicados</Text>
            <Text style={styles.emptyText}>
              Aún no tienes productos en el catálogo público.{'\n'}
              Crea productos y publícalos para que aparezcan aquí.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateProduct')}
            >
              <Text style={styles.emptyButtonText}>Crear y Publicar Producto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {products.map((product) => {
              const availability = getAvailabilityStatus(product.stock, product.estado);
              const isOwnProduct = product.usuarioId === user?.id;
              
              return (
                <View key={product.id} style={[
                  styles.productCard,
                  isOwnProduct && styles.ownProductCard
                ]}>
                  {/* Product Header */}
                  <View style={styles.productHeader}>
                    <Text style={styles.categoryIcon}>
                      {getCategoryIcon(product.categoria)}
                    </Text>
                    <View style={styles.headerBadges}>
                      {isOwnProduct && (
                        <View style={styles.ownBadge}>
                          <Text style={styles.ownBadgeText}>Tuyo</Text>
                        </View>
                      )}
                      <View style={styles.publicBadge}>
                        <Text style={styles.publicIcon}>🌐</Text>
                      </View>
                    </View>
                  </View>

                  {/* Product Info */}
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.nombre}
                  </Text>
                  <Text style={styles.productCategory}>
                    {product.categoria}
                  </Text>
                  
                  {/* Seller Info for products that are not owned */}
                  {!isOwnProduct && product.vendedorNombre && (
                    <Text style={styles.sellerInfo}>
                      Por: {product.vendedorNombre}
                    </Text>
                  )}
                  
                  <Text style={styles.productDescription} numberOfLines={3}>
                    {product.descripcion}
                  </Text>

                  {/* Price and Stock */}
                  <View style={styles.productDetails}>
                    <Text style={styles.price}>${product.precio.toFixed(2)}</Text>
                    <Text style={[
                      styles.stockBadge,
                      { backgroundColor: availability.color }
                    ]}>
                      {availability.icon} {product.stock}
                    </Text>
                  </View>

                  {/* Availability Status */}
                  <View style={[
                    styles.availabilityBadge,
                    { backgroundColor: availability.color }
                  ]}>
                    <Text style={styles.availabilityText}>
                      {availability.text}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsContainer}>
                    {user?.role === 'ADMIN' ? (
                      // Actions for ADMIN users
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.adminButton]}
                          onPress={() => navigation.navigate('PublishProduct', { product })}
                        >
                          <Text style={styles.adminButtonText}>🛡️ Gestionar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.moderateButton]}
                          onPress={() => {
                            Alert.alert(
                              'Acciones de Moderación',
                              'Selecciona una acción como administrador:',
                              [
                                { text: 'Cancelar', style: 'cancel' },
                                { 
                                  text: 'Despublicar', 
                                  style: 'destructive',
                                  onPress: () => Alert.alert('Info', 'Funcionalidad de moderación próximamente')
                                },
                                { 
                                  text: 'Ver Reportes',
                                  onPress: () => navigation.navigate('SalesReport')
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.moderateButtonText}>🔧 Moderar</Text>
                        </TouchableOpacity>
                      </>
                    ) : isOwnProduct ? (
                      // Actions for own products (USUARIO role)
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.viewSalesButton]}
                          onPress={() => navigation.navigate('SalesReport')}
                        >
                          <Text style={styles.viewSalesButtonText}>📊 Ventas</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.manageButton]}
                          onPress={() => navigation.navigate('PublishProduct', { product })}
                        >
                          <Text style={styles.manageButtonText}>⚙️ Gestionar</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      // Actions for other users' products (USUARIO role)
                      <>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.buyButton,
                            (product.stock === 0 || product.estado !== 'DISPONIBLE') && styles.disabledButton
                          ]}
                          onPress={() => handleBuyProduct(product)}
                          disabled={product.stock === 0 || product.estado !== 'DISPONIBLE'}
                        >
                          <Text style={styles.buyButtonText}>🛒 Comprar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.contactButton]}
                          onPress={() => {
                            Alert.alert(
                              'Contactar Vendedor',
                              `¿Quieres contactar a ${product.vendedorNombre || 'este vendedor'}?`,
                              [
                                { text: 'Cancelar', style: 'cancel' },
                                { text: 'Contactar', onPress: () => {
                                  Alert.alert('Info', 'Funcionalidad de contacto próximamente');
                                }}
                              ]
                            );
                          }}
                        >
                          <Text style={styles.contactButtonText}>💬 Contactar</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Buy Modal */}
      <Modal
        visible={showBuyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBuyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Text style={styles.modalTitle}>Comprar Producto</Text>
                
                <View style={styles.productModalInfo}>
                  <Text style={styles.modalProductName}>
                    {selectedProduct.nombre}
                  </Text>
                  <Text style={styles.modalProductPrice}>
                    ${selectedProduct.precio.toFixed(2)} c/u
                  </Text>
                  <Text style={styles.modalProductStock}>
                    Stock disponible: {selectedProduct.stock}
                  </Text>
                </View>

                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Cantidad:</Text>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </View>

                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>
                    Total: ${(selectedProduct.precio * parseInt(quantity || '0')).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setShowBuyModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirmButton]}
                    onPress={handleConfirmPurchase}
                    disabled={buyingLoading}
                  >
                    {buyingLoading ? (
                      <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                      <Text style={styles.modalConfirmText}>Comprar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.light,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: Border.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backIcon: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  headerSpacer: {
    width: 44,
  },
  statsHeader: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.light,
  },
  statCard: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statIcon: {
    fontSize: Typography.fontSize.lg,
    marginBottom: Spacing.xs,
  },
  statNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  productGrid: {
    padding: Spacing.lg,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    width: '48%' as const,
    ...Shadows.medium,
  },
  productHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    fontSize: Typography.fontSize.xl,
  },
  publicBadge: {
    backgroundColor: Colors.success,
    borderRadius: Border.radius.round,
    width: 24,
    height: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  publicIcon: {
    fontSize: Typography.fontSize.sm,
  },
  productName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    minHeight: 40,
  },
  productCategory: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  productDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
    minHeight: 54,
  },
  productDetails: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  stockBadge: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Border.radius.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  availabilityBadge: {
    alignItems: 'center' as const,
    paddingVertical: Spacing.xs,
    borderRadius: Border.radius.sm,
    marginBottom: Spacing.md,
  },
  availabilityText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  manageButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: Border.radius.md,
    alignItems: 'center' as const,
  },
  manageButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Border.radius.lg,
    ...Shadows.medium,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Actions Container
  actionsContainer: {
    flexDirection: 'row' as const,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Border.radius.md,
    alignItems: 'center' as const,
  },
  buyButton: {
    backgroundColor: Colors.success,
  },
  buyButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  disabledButton: {
    backgroundColor: Colors.gray,
    opacity: 0.6,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.xl,
    width: '100%' as const,
    maxWidth: 400,
    ...Shadows.heavy,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center' as const,
    marginBottom: Spacing.lg,
  },
  productModalInfo: {
    backgroundColor: Colors.lightGray,
    borderRadius: Border.radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modalProductName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  modalProductPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  modalProductStock: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  quantityContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.lg,
  },
  quantityLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Border.radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    textAlign: 'center' as const,
    width: 80,
  },
  totalContainer: {
    backgroundColor: Colors.primary,
    borderRadius: Border.radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  totalText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    textAlign: 'center' as const,
  },
  modalActions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: Border.radius.md,
    alignItems: 'center' as const,
  },
  modalCancelButton: {
    backgroundColor: Colors.lightGray,
  },
  modalConfirmButton: {
    backgroundColor: Colors.success,
  },
  modalCancelText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  modalConfirmText: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Own Product Styles
  ownProductCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  headerBadges: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.xs,
  },
  ownBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Border.radius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  ownBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  sellerInfo: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
    marginBottom: Spacing.xs,
  },
  
  // Additional Action Buttons
  viewSalesButton: {
    backgroundColor: Colors.warning,
  },
  viewSalesButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  contactButton: {
    backgroundColor: Colors.secondary || Colors.gray,
  },
  contactButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Admin Buttons
  adminButton: {
    backgroundColor: '#9C27B0', // Purple for admin
  },
  adminButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  moderateButton: {
    backgroundColor: '#FF5722', // Deep orange for moderation
  },
  moderateButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
};