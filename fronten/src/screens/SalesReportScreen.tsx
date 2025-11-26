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
import { salesService } from '../services/api';
import { Colors, Typography, Spacing, Border, Shadows } from '../styles/GlobalStyles';

interface SaleReport {
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

interface SalesStats {
  totalVentas: number;
  totalIngresos: number;
  ventasDelMes: number;
  ingresosDelMes: number;
  productoMasVendido: string;
  ventasHoy: number;
}

export default function SalesReportScreen({ navigation }: any) {
  const { token } = useContext(AuthContext);
  const [sales, setSales] = useState<SaleReport[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const loadSalesData = async () => {
    try {
      const [salesData, statsData] = await Promise.all([
        salesService.getUserSales(token, filter),
        salesService.getSalesStats(token)
      ]);
      
      setSales(Array.isArray(salesData) ? salesData : []);
      setStats(statsData);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los reportes de ventas');
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSalesData();
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
          <Text style={styles.headerTitle}>Reporte de Ventas</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
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
        <Text style={styles.headerTitle}>Reporte de Ventas</Text>
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
            <Text style={styles.sectionTitle}>📊 Estadísticas Generales</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>💰</Text>
                <Text style={styles.statNumber}>${stats.totalIngresos.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Ingresos Totales</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={styles.statNumber}>{stats.totalVentas}</Text>
                <Text style={styles.statLabel}>Ventas Totales</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statNumber}>{stats.ventasHoy}</Text>
                <Text style={styles.statLabel}>Ventas Hoy</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🏆</Text>
                <Text style={styles.statProductName}>{stats.productoMasVendido}</Text>
                <Text style={styles.statLabel}>Más Vendido</Text>
              </View>
            </View>
            
            <View style={styles.monthlyStats}>
              <Text style={styles.monthlyTitle}>📊 Este Mes</Text>
              <View style={styles.monthlyRow}>
                <View style={styles.monthlyItem}>
                  <Text style={styles.monthlyValue}>{stats.ventasDelMes}</Text>
                  <Text style={styles.monthlyLabel}>Ventas</Text>
                </View>
                <View style={styles.monthlyItem}>
                  <Text style={styles.monthlyValue}>${stats.ingresosDelMes.toFixed(2)}</Text>
                  <Text style={styles.monthlyLabel}>Ingresos</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>🔍 Filtrar Ventas</Text>
          <View style={styles.filterContainer}>
            <FilterButton filterType="all" label="Todas" />
            <FilterButton filterType="today" label="Hoy" />
            <FilterButton filterType="week" label="Semana" />
            <FilterButton filterType="month" label="Mes" />
          </View>
        </View>

        {/* Sales List */}
        <View style={styles.salesSection}>
          <Text style={styles.sectionTitle}>
            📋 Historial de Ventas ({sales.length})
          </Text>
          
          {sales.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No hay ventas registradas</Text>
              <Text style={styles.emptyText}>
                Aún no tienes ventas con el filtro seleccionado.{'\n'}
                ¡Publica más productos para aumentar tus ventas!
              </Text>
            </View>
          ) : (
            <View style={styles.salesList}>
              {sales.map((sale) => (
                <TouchableOpacity 
                  key={sale.id} 
                  style={styles.saleCard}
                  onPress={() => navigation.navigate('SaleDetail', { saleId: sale.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.saleHeader}>
                    <View style={styles.saleInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {sale.productoNombre}
                      </Text>
                      <Text style={styles.saleDate}>
                        {formatDate(sale.fechaVenta)}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(sale.estado) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusLabel(sale.estado)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.saleDetails}>
                    <View style={styles.saleRow}>
                      <Text style={styles.detailLabel}>Cantidad:</Text>
                      <Text style={styles.detailValue}>{sale.cantidad} unidades</Text>
                    </View>
                    <View style={styles.saleRow}>
                      <Text style={styles.detailLabel}>Precio unitario:</Text>
                      <Text style={styles.detailValue}>${sale.precioUnitario.toFixed(2)}</Text>
                    </View>
                    {sale.compradorNombre && (
                      <View style={styles.saleRow}>
                        <Text style={styles.detailLabel}>Comprador:</Text>
                        <Text style={styles.detailValue}>{sale.compradorNombre}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.saleFooter}>
                    <View style={styles.saleFooterLeft}>
                      <Text style={styles.totalLabel}>Total:</Text>
                      <Text style={styles.totalAmount}>${sale.total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.saleFooterRight}>
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
  statProductName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    textAlign: 'center' as const,
    minHeight: 20,
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
    color: Colors.success,
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
  
  // Sales Section
  salesSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  salesList: {
    gap: Spacing.md,
  },
  saleCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  saleHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: Spacing.md,
  },
  saleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  productName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  saleDate: {
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
  saleDetails: {
    marginBottom: Spacing.md,
  },
  saleRow: {
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
  saleFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saleFooterLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
  },
  saleFooterRight: {
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
    color: Colors.success,
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
  },
};