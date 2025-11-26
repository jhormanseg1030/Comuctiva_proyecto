import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
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
  publicado: boolean;
}

interface PublishProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onPublish: (productId: number, published: boolean) => void;
  loading: boolean;
}

const PublishProductModal: React.FC<PublishProductModalProps> = ({
  visible,
  product,
  onClose,
  onPublish,
  loading,
}) => {
  if (!product) return null;

  const handleTogglePublish = () => {
    Alert.alert(
      product.publicado ? 'Despublicar Producto' : 'Publicar Producto',
      product.publicado 
        ? '¿Estás seguro de que deseas despublicar este producto? No será visible para los clientes.'
        : '¿Estás seguro de que deseas publicar este producto? Será visible para todos los clientes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: product.publicado ? 'Despublicar' : 'Publicar',
          style: product.publicado ? 'destructive' : 'default',
          onPress: () => onPublish(product.id, !product.publicado),
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Gestión de Publicación</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Text style={modalStyles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={modalStyles.content}>
            <View style={modalStyles.productInfo}>
              <Text style={modalStyles.productName}>{product.nombre}</Text>
              <Text style={modalStyles.productPrice}>${product.precio.toFixed(2)}</Text>
            </View>

            <View style={modalStyles.statusContainer}>
              <View style={[
                modalStyles.statusIndicator,
                { backgroundColor: product.publicado ? Colors.success : Colors.warning }
              ]}>
                <Text style={modalStyles.statusIcon}>
                  {product.publicado ? '🌐' : '👁️‍🗨️'}
                </Text>
                <Text style={modalStyles.statusText}>
                  {product.publicado ? 'PUBLICADO' : 'BORRADOR'}
                </Text>
              </View>
            </View>

            <Text style={modalStyles.description}>
              {product.publicado
                ? 'Este producto está actualmente visible para todos los clientes. Pueden verlo, comprarlo y agregarlo a su carrito.'
                : 'Este producto está en modo borrador. Solo tú puedes verlo. Publícalo para que esté disponible para los clientes.'
              }
            </Text>

            <View style={modalStyles.actionButtons}>
              <TouchableOpacity
                style={[
                  modalStyles.actionButton,
                  product.publicado ? modalStyles.unpublishButton : modalStyles.publishButton,
                  loading && modalStyles.buttonDisabled,
                ]}
                onPress={handleTogglePublish}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Text style={modalStyles.actionIcon}>
                      {product.publicado ? '📵' : '🚀'}
                    </Text>
                    <Text style={modalStyles.actionButtonText}>
                      {product.publicado ? 'Despublicar' : 'Publicar Ahora'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {product.publicado && (
              <View style={modalStyles.publishedInfo}>
                <Text style={modalStyles.infoTitle}>📊 Estado de Publicación:</Text>
                <Text style={modalStyles.infoText}>
                  • Visible en catálogo público{'\n'}
                  • Disponible para compra{'\n'}
                  • Incluido en búsquedas{'\n'}
                  • Stock: {product.stock} unidades
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function PublishProductScreen({ navigation, route }: any) {
  const { token } = useContext(AuthContext);
  const { product: initialProduct } = route.params;
  const [product, setProduct] = useState<Product>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePublishToggle = async (productId: number, published: boolean) => {
    setLoading(true);
    try {
      await productService.togglePublishProduct(productId, published, token);
      
      setProduct(prev => ({
        ...prev,
        publicado: published,
      }));

      Alert.alert(
        'Éxito',
        published 
          ? 'Producto publicado correctamente. Ahora es visible para los clientes.'
          : 'Producto despublicado. Ya no es visible para los clientes.',
        [{ text: 'OK' }]
      );
      
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar el estado de publicación');
    } finally {
      setLoading(false);
    }
  };

  const getPublishStatus = () => {
    if (product.publicado) {
      return {
        status: 'PUBLICADO',
        color: Colors.success,
        icon: '🌐',
        description: 'Visible para clientes'
      };
    } else {
      return {
        status: 'BORRADOR',
        color: Colors.warning,
        icon: '👁️‍🗨️',
        description: 'Solo visible para ti'
      };
    }
  };

  const publishInfo = getPublishStatus();

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
        <Text style={styles.headerTitle}>Publicar Producto</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.nombre}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: publishInfo.color }
            ]}>
              <Text style={styles.statusIcon}>{publishInfo.icon}</Text>
              <Text style={styles.statusText}>{publishInfo.status}</Text>
            </View>
          </View>

          <Text style={styles.productDescription}>{product.descripcion}</Text>

          <View style={styles.productDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Precio:</Text>
              <Text style={styles.detailValue}>${product.precio.toFixed(2)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stock:</Text>
              <Text style={styles.detailValue}>{product.stock}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Categoría:</Text>
              <Text style={styles.detailValue}>{product.categoria}</Text>
            </View>
          </View>

          <Text style={styles.statusDescription}>{publishInfo.description}</Text>
        </View>

        {/* Publication Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>🚀 Gestión de Publicación</Text>
          
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.manageIcon}>⚙️</Text>
            <View style={styles.manageInfo}>
              <Text style={styles.manageTitle}>Gestionar Publicación</Text>
              <Text style={styles.manageSubtitle}>
                {product.publicado ? 'Despublicar o modificar estado' : 'Publicar para clientes'}
              </Text>
            </View>
            <Text style={styles.manageArrow}>→</Text>
          </TouchableOpacity>

          {product.publicado && (
            <View style={styles.publishedStats}>
              <Text style={styles.statsTitle}>📈 Estadísticas de Publicación</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>👀</Text>
                  <Text style={styles.statLabel}>Visible</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>🛒</Text>
                  <Text style={styles.statLabel}>Comprable</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>🔍</Text>
                  <Text style={styles.statLabel}>Buscable</Text>
                </View>
              </View>
            </View>
          )}

          {!product.publicado && (
            <View style={styles.draftInfo}>
              <Text style={styles.draftTitle}>📝 Producto en Borrador</Text>
              <Text style={styles.draftDescription}>
                Este producto aún no está publicado. Para hacerlo visible a los clientes:
              </Text>
              <View style={styles.draftSteps}>
                <Text style={styles.draftStep}>1. Verifica que toda la información esté correcta</Text>
                <Text style={styles.draftStep}>2. Asegúrate de tener stock disponible</Text>
                <Text style={styles.draftStep}>3. Haz clic en "Gestionar Publicación"</Text>
                <Text style={styles.draftStep}>4. Selecciona "Publicar Ahora"</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <PublishProductModal
        visible={modalVisible}
        product={product}
        onClose={() => setModalVisible(false)}
        onPublish={handlePublishToggle}
        loading={loading}
      />
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  productHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  productName: {
    flex: 1,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginRight: Spacing.md,
  },
  statusBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Border.radius.lg,
  },
  statusIcon: {
    fontSize: Typography.fontSize.sm,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  productDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  productDetails: {
    marginBottom: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  statusDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  actionsCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.xl,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  actionsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  manageButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.lightGray,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  manageIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  manageInfo: {
    flex: 1,
  },
  manageTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  manageSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  manageArrow: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
  publishedStats: {
    marginBottom: Spacing.lg,
  },
  statsTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  draftInfo: {},
  draftTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  draftDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  draftSteps: {},
  draftStep: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
};

const modalStyles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Border.radius.xl,
    borderTopRightRadius: Border.radius.xl,
    maxHeight: '80%' as const,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.sm,
    borderRadius: Border.radius.round,
    backgroundColor: Colors.lightGray,
  },
  closeIcon: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  content: {
    padding: Spacing.lg,
  },
  productInfo: {
    alignItems: 'center' as const,
    marginBottom: Spacing.lg,
  },
  productName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  productPrice: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  statusContainer: {
    alignItems: 'center' as const,
    marginBottom: Spacing.lg,
  },
  statusIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Border.radius.lg,
  },
  statusIcon: {
    fontSize: Typography.fontSize.sm,
    marginRight: Spacing.xs,
  },
  statusText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  actionButtons: {
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: Spacing.lg,
    borderRadius: Border.radius.lg,
    ...Shadows.medium,
  },
  publishButton: {
    backgroundColor: Colors.success,
  },
  unpublishButton: {
    backgroundColor: Colors.warning,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.sm,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  publishedInfo: {
    backgroundColor: Colors.lightGray,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
  },
  infoTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
};