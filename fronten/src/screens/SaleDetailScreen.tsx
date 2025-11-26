import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { salesService } from '../services/api';
import { Colors, Typography, Spacing, Border, Shadows } from '../styles/GlobalStyles';

interface Sale {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fechaVenta: string;
  compradorNombre?: string;
  compradorEmail?: string;
  estado: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA';
}

export default function SaleDetailScreen({ route, navigation }: any) {
  const { saleId } = route.params;
  const { token } = useContext(AuthContext);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadSaleDetail();
  }, []);

  const loadSaleDetail = async () => {
    try {
      // Aquí deberías implementar un endpoint para obtener una venta específica
      // Por ahora simularemos la carga
      setLoading(false);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el detalle de la venta');
      navigation.goBack();
    }
  };

  const handleCompleteSale = async () => {
    Alert.alert(
      'Confirmar acción',
      '¿Estás seguro de que quieres marcar esta venta como completada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setActionLoading(true);
            try {
              await salesService.completeSale(token, saleId);
              Alert.alert('Éxito', 'Venta marcada como completada');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo completar la venta');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelSale = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Por favor ingresa un motivo para la cancelación');
      return;
    }

    setActionLoading(true);
    try {
      await salesService.cancelSale(token, saleId, cancelReason);
      Alert.alert('Éxito', 'Venta cancelada correctamente');
      setShowCancelModal(false);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo cancelar la venta');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA':
        return Colors.success;
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
        return 'Completada';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return estado;
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
          <Text style={styles.headerTitle}>Detalle de Venta</Text>
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
  const sampleSale: Sale = {
    id: saleId,
    productoId: 1,
    productoNombre: 'iPhone 14 Pro Max',
    cantidad: 2,
    precioUnitario: 1299.99,
    total: 2599.98,
    fechaVenta: new Date().toISOString(),
    compradorNombre: 'Juan Pérez',
    compradorEmail: 'juan.perez@email.com',
    estado: 'PENDIENTE'
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
        <Text style={styles.headerTitle}>Detalle de Venta #{sampleSale.id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Estado de la Venta</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(sampleSale.estado) }
            ]}>
              <Text style={styles.statusText}>
                {getStatusLabel(sampleSale.estado)}
              </Text>
            </View>
          </View>
          <Text style={styles.saleDate}>
            📅 {formatDate(sampleSale.fechaVenta)}
          </Text>
        </View>

        {/* Product Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>📦 Información del Producto</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Producto:</Text>
            <Text style={styles.infoValue}>{sampleSale.productoNombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cantidad:</Text>
            <Text style={styles.infoValue}>{sampleSale.cantidad} unidades</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Precio unitario:</Text>
            <Text style={styles.infoValue}>${sampleSale.precioUnitario.toFixed(2)}</Text>
          </View>
        </View>

        {/* Buyer Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>👤 Información del Comprador</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{sampleSale.compradorNombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{sampleSale.compradorEmail}</Text>
          </View>
        </View>

        {/* Total Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total de la Venta:</Text>
            <Text style={styles.totalAmount}>${sampleSale.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Actions */}
        {sampleSale.estado === 'PENDIENTE' && (
          <View style={styles.actionsContainer}>
            <Text style={styles.cardTitle}>⚡ Acciones</Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleCompleteSale}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.actionIcon}>✅</Text>
                  <Text style={styles.actionText}>Marcar como Completada</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setShowCancelModal(true)}
              disabled={actionLoading}
            >
              <Text style={styles.actionIcon}>❌</Text>
              <Text style={styles.actionText}>Cancelar Venta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancelar Venta</Text>
            <Text style={styles.modalSubtitle}>
              Por favor ingresa el motivo de la cancelación:
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Motivo de cancelación..."
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleCancelSale}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  statusTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Border.radius.md,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  saleDate: {
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
  infoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  infoValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'right' as const,
    flex: 1,
    marginLeft: Spacing.md,
  },
  
  // Total Card
  totalCard: {
    backgroundColor: Colors.success,
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
  
  // Actions
  actionsContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: Spacing.lg,
    borderRadius: Border.radius.lg,
    marginTop: Spacing.md,
    ...Shadows.medium,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  actionIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.md,
  },
  actionText: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Modal
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
    marginBottom: Spacing.md,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: Spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Border.radius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    minHeight: 100,
    marginBottom: Spacing.lg,
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
    backgroundColor: Colors.error,
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
};