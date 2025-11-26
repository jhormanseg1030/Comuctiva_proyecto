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
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { productService } from '../services/api';
import { Colors, Typography, Spacing, Border, Shadows } from '../styles/GlobalStyles';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  estado: string;
  publicado?: boolean;
  fechaCreacion?: string;
}

export default function ProductListScreen({ navigation }: any) {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts(token);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'DISPONIBLE':
        return Colors.success;
      case 'AGOTADO':
        return Colors.warning;
      case 'DESCONTINUADO':
        return Colors.error;
      default:
        return Colors.gray;
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'DISPONIBLE':
        return 'Disponible';
      case 'AGOTADO':
        return 'Agotado';
      case 'DESCONTINUADO':
        return 'Descontinuado';
      default:
        return estado;
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
          <Text style={styles.headerTitle}>Productos</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando productos...</Text>
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
        <Text style={styles.headerTitle}>Productos ({products.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateProduct')}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
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
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No hay productos</Text>
            <Text style={styles.emptyText}>
              Aún no has creado ningún producto.{'\n'}
              ¡Comienza agregando tu primer producto!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateProduct')}
            >
              <Text style={styles.emptyButtonText}>Crear Primer Producto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productList}>
            {products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <View style={styles.productInfo}>
                    <Text style={styles.categoryIcon}>
                      {getCategoryIcon(product.categoria)}
                    </Text>
                    <View style={styles.productDetails}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {product.nombre}
                      </Text>
                      <Text style={styles.productCategory}>
                        {product.categoria}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(product.estado) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusLabel(product.estado)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.descripcion}
                </Text>

                <View style={styles.productFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Precio:</Text>
                    <Text style={styles.price}>${product.precio.toFixed(2)}</Text>
                  </View>
                  <View style={styles.stockContainer}>
                    <Text style={styles.stockLabel}>Stock:</Text>
                    <Text style={[
                      styles.stock,
                      { color: product.stock > 10 ? Colors.success : Colors.warning }
                    ]}>
                      {product.stock}
                    </Text>
                  </View>
                </View>

                {/* Publication Status and Actions */}
                <View style={styles.publishSection}>
                  <View style={styles.publishStatus}>
                    <Text style={styles.publishIcon}>
                      {product.publicado ? '🌐' : '👁️‍🗨️'}
                    </Text>
                    <Text style={[
                      styles.publishText,
                      { color: product.publicado ? Colors.success : Colors.warning }
                    ]}>
                      {product.publicado ? 'Publicado' : 'Borrador'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.publishButton}
                    onPress={() => navigation.navigate('PublishProduct', { product })}
                  >
                    <Text style={styles.publishButtonText}>
                      {product.publicado ? 'Gestionar' : 'Publicar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  addButton: {
    padding: Spacing.sm,
    borderRadius: Border.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  addIcon: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
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
  productList: {
    padding: Spacing.lg,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  productHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  productInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  categoryIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  productCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Border.radius.md,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  productDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  productFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  priceContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  priceLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  price: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  stockContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  stockLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  stock: {
    fontSize: Typography.fontSize.md,
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
  publishSection: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  publishStatus: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  publishIcon: {
    fontSize: Typography.fontSize.md,
    marginRight: Spacing.xs,
  },
  publishText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  publishButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Border.radius.md,
  },
  publishButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
};