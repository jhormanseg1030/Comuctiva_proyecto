import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { purchaseService } from '../services/api';
import { Colors, Typography, Spacing, Border, Shadows } from '../styles/GlobalStyles';

interface PurchaseDetail {
  id: number;
  productoId: number;
  productoNombre: string;
  productoDescripcion?: string;
  productoImagen?: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fechaCompra: string;
  vendedorNombre: string;
  vendedorEmail?: string;
  vendedorTelefono?: string;
  estado: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA' | 'ENVIADA';
  metodoPago: string;
  direccionEnvio?: string;
  codigoSeguimiento?: string;
  fechaEnvio?: string;
  fechaEntrega?: string;
  notasVendedor?: string;
}

export default function PurchaseDetailScreen({ route, navigation }: any) {
  const { purchaseId } = route.params;
  const { token } = useContext(AuthContext);
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchaseDetail();
  }, []);

  const loadPurchaseDetail = async () => {
    try {
      const purchaseData = await purchaseService.getPurchaseDetail(token, purchaseId);
      setPurchase(purchaseData);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el detalle de la compra');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA':
        return Colors.success;
      case 'ENVIADA':
        return Colors.primary;
      case 'PENDIENTE':
        return Colors.warning;
      case 'CANCELADA':
        return Colors.error;
      default:
        return Colors.gray;
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA':
        return 'Entregada';
      case 'ENVIADA':
        return 'Enviada';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA':
        return '✅';
      case 'ENVIADA':
        return '📦';
      case 'PENDIENTE':
        return '⏳';
      case 'CANCELADA':
        return '❌';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContactSeller = () => {
    if (!purchase?.vendedorEmail) {
      Alert.alert('Información', 'No hay información de contacto disponible');
      return;
    }

    Alert.alert(
      'Contactar Vendedor',
      `¿Cómo quieres contactar a ${purchase.vendedorNombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => Linking.openURL(`mailto:${purchase.vendedorEmail}`)
        },
        ...(purchase.vendedorTelefono ? [{
          text: 'Teléfono',
          onPress: () => Linking.openURL(`tel:${purchase.vendedorTelefono}`)
        }] : [])
      ]
    );
  };

  const handleTrackPackage = () => {
    if (!purchase?.codigoSeguimiento) {
      Alert.alert('Información', 'No hay código de seguimiento disponible aún');
      return;
    }

    Alert.alert(
      'Rastrear Paquete',
      `Código de seguimiento: ${purchase.codigoSeguimiento}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Copiar Código',
          onPress: () => {
            // Aquí podrías implementar copiar al portapapeles
            Alert.alert('Copiado', 'Código copiado al portapapeles');
          }
        }
      ]
    );
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
          <Text style={styles.headerTitle}>Detalle de Compra</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando detalle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Datos de ejemplo - reemplazar con datos reales de la API
  const samplePurchase: PurchaseDetail = {
    id: purchaseId,
    productoId: 1,
    productoNombre: 'MacBook Pro 14"',
    productoDescripcion: 'MacBook Pro 14" con chip M2 Pro, 16GB RAM, 512GB SSD',
    cantidad: 1,
    precioUnitario: 2499.99,
    total: 2499.99,
    fechaCompra: new Date().toISOString(),
    vendedorNombre: 'TechStore México',
    vendedorEmail: 'ventas@techstore.com',
    vendedorTelefono: '+52 55 1234 5678',
    estado: 'ENVIADA',
    metodoPago: 'Tarjeta de Crédito **** 1234',
    direccionEnvio: 'Av. Insurgentes Sur 123, Col. Roma Norte, CDMX',
    codigoSeguimiento: 'TS2024110001',
    fechaEnvio: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notasVendedor: 'Producto empacado con cuidado. Tiempo estimado de entrega: 2-3 días hábiles.'
  };

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
        <Text style={styles.headerTitle}>Compra #{samplePurchase.id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusIcon}>
                {getStatusIcon(samplePurchase.estado)}
              </Text>
              <View>
                <Text style={styles.statusTitle}>Estado de la Compra</Text>
                <Text style={[
                  styles.statusLabel,
                  { color: getStatusColor(samplePurchase.estado) }
                ]}>
                  {getStatusLabel(samplePurchase.estado)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.purchaseDate}>
            📅 Comprado el {formatDate(samplePurchase.fechaCompra)}
          </Text>
        </View>

        {/* Product Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>📦 Producto Comprado</Text>
          <Text style={styles.productTitle}>{samplePurchase.productoNombre}</Text>
          {samplePurchase.productoDescripcion && (
            <Text style={styles.productDescription}>{samplePurchase.productoDescripcion}</Text>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cantidad:</Text>
            <Text style={styles.infoValue}>{samplePurchase.cantidad} unidades</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Precio unitario:</Text>
            <Text style={styles.infoValue}>${samplePurchase.precioUnitario.toFixed(2)}</Text>
          </View>
        </View>

        {/* Seller Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>👤 Información del Vendedor</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vendedor:</Text>
            <Text style={styles.infoValue}>{samplePurchase.vendedorNombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{samplePurchase.vendedorEmail}</Text>
          </View>
          {samplePurchase.vendedorTelefono && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{samplePurchase.vendedorTelefono}</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSeller}
          >
            <Text style={styles.contactButtonText}>📞 Contactar Vendedor</Text>
          </TouchableOpacity>
        </View>

        {/* Payment & Shipping */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>💳 Pago y Envío</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Método de pago:</Text>
            <Text style={styles.infoValue}>{samplePurchase.metodoPago}</Text>
          </View>
          {samplePurchase.direccionEnvio && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValueMultiline}>{samplePurchase.direccionEnvio}</Text>
            </View>
          )}
          {samplePurchase.fechaEnvio && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de envío:</Text>
              <Text style={styles.infoValue}>{formatDate(samplePurchase.fechaEnvio)}</Text>
            </View>
          )}
        </View>

        {/* Tracking Info */}
        {samplePurchase.codigoSeguimiento && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>📦 Información de Seguimiento</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Código:</Text>
              <Text style={styles.trackingCode}>{samplePurchase.codigoSeguimiento}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.trackButton}
              onPress={handleTrackPackage}
            >
              <Text style={styles.trackButtonText}>📍 Rastrear Paquete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seller Notes */}
        {samplePurchase.notasVendedor && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>📝 Notas del Vendedor</Text>
            <Text style={styles.sellerNotes}>{samplePurchase.notasVendedor}</Text>
          </View>
        )}

        {/* Total Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pagado:</Text>
            <Text style={styles.totalAmount}>${samplePurchase.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Button */}
        {samplePurchase.estado === 'ENVIADA' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Confirmar Recepción',
                '¿Has recibido tu producto y estás satisfecho con la compra?',
                [
                  { text: 'No', style: 'cancel' },
                  {
                    text: 'Sí, confirmar',
                    onPress: () => {
                      Alert.alert('¡Gracias!', 'Hemos marcado tu compra como recibida');
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.actionButtonText}>✅ Confirmar Recepción</Text>
          </TouchableOpacity>
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
    paddingHorizontal: Spacing.lg,
  },
  
  // Status Card
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadows.medium,
  },
  statusHeader: {
    marginBottom: Spacing.md,
  },
  statusLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.md,
  },
  statusIcon: {
    fontSize: Typography.fontSize.xxl,
  },
  statusTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  statusLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  purchaseDate: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  
  // Info Cards
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadows.medium,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  productTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  productDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  infoValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'right' as const,
    flex: 1,
    marginLeft: Spacing.md,
  },
  infoValueMultiline: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'right' as const,
    flex: 1,
    marginLeft: Spacing.md,
    lineHeight: 20,
  },
  trackingCode: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: 'monospace' as const,
    textAlign: 'right' as const,
    flex: 1,
    marginLeft: Spacing.md,
  },
  sellerNotes: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic' as const,
  },
  
  // Action Buttons
  contactButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Border.radius.md,
    alignItems: 'center' as const,
    marginTop: Spacing.md,
  },
  contactButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  trackButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.md,
    borderRadius: Border.radius.md,
    alignItems: 'center' as const,
    marginTop: Spacing.md,
  },
  trackButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  actionButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.lg,
    borderRadius: Border.radius.lg,
    alignItems: 'center' as const,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Total Card
  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadows.medium,
  },
  totalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  totalAmount: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
};