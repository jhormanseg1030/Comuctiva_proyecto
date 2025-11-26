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
import { purchaseService } from '../services/api';
import { Colors, Typography, Spacing, Border, Shadows } from '../styles/GlobalStyles';

interface Purchase {
  id: number;
  productoId: number;
  productoNombre: string;
  productoImagen?: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fechaCompra: string;
  vendedorNombre: string;
  vendedorEmail?: string;
  estado: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA' | 'ENVIADA';
  metodoPago?: string;
  direccionEnvio?: string;
}

interface PurchaseStats {
  totalCompras: number;
  totalGastado: number;
  comprasDelMes: number;
  gastoDelMes: number;
  comprasHoy: number;
  productosUnicos: number;
}

export default function PurchasesScreen({ navigation }: any) {
  const { token } = useContext(AuthContext);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const loadPurchasesData = async () => {
    try {
      const [purchasesData, statsData] = await Promise.all([
        purchaseService.getUserPurchases(token, filter),
        purchaseService.getPurchaseStats(token)
      ]);
      
      setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
      setStats(statsData);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar las compras');
      console.error('Error loading purchases data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPurchasesData();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPurchasesData();
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
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const FilterButton = ({ filterType, label }: { filterType: typeof filter; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.filterButtonActive
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Mis Compras</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando compras...</Text>
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
        <Text style={styles.headerTitle}>Mis Compras</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>🛒 Estadísticas de Compras</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>💸</Text>
                <Text style={styles.statNumber}>${stats.totalGastado.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Total Gastado</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🛍️</Text>
                <Text style={styles.statNumber}>{stats.totalCompras}</Text>
                <Text style={styles.statLabel}>Total Compras</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statNumber}>{stats.comprasHoy}</Text>
                <Text style={styles.statLabel}>Compras Hoy</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📦</Text>
                <Text style={styles.statNumber}>{stats.productosUnicos}</Text>
                <Text style={styles.statLabel}>Productos Únicos</Text>
              </View>
            </View>
            
            <View style={styles.monthlyStats}>
              <Text style={styles.monthlyTitle}>📊 Este Mes</Text>
              <View style={styles.monthlyRow}>
                <View style={styles.monthlyItem}>
                  <Text style={styles.monthlyValue}>{stats.comprasDelMes}</Text>
                  <Text style={styles.monthlyLabel}>Compras</Text>
                </View>
                <View style={styles.monthlyItem}>
                  <Text style={styles.monthlyValue}>${stats.gastoDelMes.toFixed(2)}</Text>
                  <Text style={styles.monthlyLabel}>Gastado</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>🔍 Filtrar Compras</Text>
          <View style={styles.filterContainer}>
            <FilterButton filterType="all" label="Todas" />
            <FilterButton filterType="today" label="Hoy" />
            <FilterButton filterType="week" label="Semana" />
            <FilterButton filterType="month" label="Mes" />
          </View>
        </View>

        {/* Purchases List */}
        <View style={styles.purchasesSection}>
          <Text style={styles.sectionTitle}>
            🛍️ Historial de Compras ({purchases.length})
          </Text>
          
          {purchases.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyTitle}>No hay compras registradas</Text>
              <Text style={styles.emptyText}>
                Aún no tienes compras con el filtro seleccionado.{'\n'}
                ¡Explora el catálogo para hacer tu primera compra!
              </Text>
              <View style={styles.emptyActions}>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('PublishedProducts')}
                >
                  <Text style={styles.exploreButtonText}>🛒 Explorar Marketplace</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.sellButton}
                  onPress={() => navigation.navigate('CreateProduct')}
                >
                  <Text style={styles.sellButtonText}>📦 Vender Productos</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.purchasesList}>
              {purchases.map((purchase) => (
                <TouchableOpacity 
                  key={purchase.id} 
                  style={styles.purchaseCard}
                  onPress={() => navigation.navigate('PurchaseDetail', { purchaseId: purchase.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.purchaseHeader}>
                    <View style={styles.purchaseInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {purchase.productoNombre}
                      </Text>
                      <Text style={styles.purchaseDate}>
                        {formatDate(purchase.fechaCompra)}
                      </Text>
                      <Text style={styles.sellerInfo}>
                        Vendido por: {purchase.vendedorNombre}
                      </Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <Text style={styles.statusIcon}>
                        {getStatusIcon(purchase.estado)}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(purchase.estado) }
                      ]}>
                        <Text style={styles.statusText}>
                          {getStatusLabel(purchase.estado)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.purchaseDetails}>
                    <View style={styles.purchaseRow}>
                      <Text style={styles.detailLabel}>Cantidad:</Text>
                      <Text style={styles.detailValue}>{purchase.cantidad} unidades</Text>
                    </View>
                    <View style={styles.purchaseRow}>
                      <Text style={styles.detailLabel}>Precio unitario:</Text>
                      <Text style={styles.detailValue}>${purchase.precioUnitario.toFixed(2)}</Text>
                    </View>
                    {purchase.metodoPago && (
                      <View style={styles.purchaseRow}>
                        <Text style={styles.detailLabel}>Método de pago:</Text>
                        <Text style={styles.detailValue}>{purchase.metodoPago}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.purchaseFooter}>
                    <View style={styles.purchaseFooterLeft}>
                      <Text style={styles.totalLabel}>Total:</Text>
                      <Text style={styles.totalAmount}>${purchase.total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.purchaseFooterRight}>
                      <Text style={styles.viewDetailText}>Ver detalle</Text>
                      <Text style={styles.arrowIcon}>→</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  
  // Stats Section
  statsSection: {
    marginTop: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.lg,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    alignItems: 'center' as const,
    width: '48%' as const,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  statIcon: {
    fontSize: Typography.fontSize.xl,
    marginBottom: Spacing.sm,
  },
  statNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    textAlign: 'center' as const,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  
  // Monthly Stats
  monthlyStats: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  monthlyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center' as const,
  },
  monthlyRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
  },
  monthlyItem: {
    alignItems: 'center' as const,
  },
  monthlyValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  monthlyLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  
  // Filter Section
  filterSection: {
    marginTop: Spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.sm,
    ...Shadows.light,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Border.radius.md,
    alignItems: 'center' as const,
    marginHorizontal: Spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Purchases Section
  purchasesSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  purchasesList: {
    gap: Spacing.md,
  },
  purchaseCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  purchaseHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: Spacing.md,
  },
  purchaseInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  productName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  purchaseDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  sellerInfo: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  statusContainer: {
    alignItems: 'center' as const,
  },
  statusIcon: {
    fontSize: Typography.fontSize.lg,
    marginBottom: Spacing.xs,
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
  purchaseDetails: {
    marginBottom: Spacing.md,
  },
  purchaseRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  purchaseFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  purchaseFooterLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
  },
  purchaseFooterRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  totalAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  viewDetailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  arrowIcon: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center' as const,
    padding: Spacing.xxl,
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    ...Shadows.light,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Border.radius.lg,
    ...Shadows.medium,
  },
  exploreButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Empty Actions
  emptyActions: {
    flexDirection: 'column' as const,
    gap: Spacing.md,
    alignItems: 'center' as const,
  },
  sellButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Border.radius.lg,
    ...Shadows.medium,
  },
  sellButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
};