import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Colors, Typography, Spacing, Border, Shadows } from '../styles/GlobalStyles';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USUARIO';
  fechaRegistro: string;
  activo: boolean;
  productosTotal: number;
  ventasTotal: number;
  comprasTotal: number;
}

export default function AdminUsersScreen({ navigation }: any) {
  const { token, user } = useContext(AuthContext);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  // Verificar que el usuario actual sea ADMIN
  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      Alert.alert(
        'Acceso Denegado',
        'Esta sección es solo para administradores.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      // Simulación de datos - en producción conectar con API
      const mockUsers: UserInfo[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@sistema.com',
          role: 'ADMIN',
          fechaRegistro: '2024-01-15',
          activo: true,
          productosTotal: 0,
          ventasTotal: 0,
          comprasTotal: 0,
        },
        {
          id: 2,
          username: 'juan_vendedor',
          email: 'juan@email.com',
          role: 'USUARIO',
          fechaRegistro: '2024-02-20',
          activo: true,
          productosTotal: 8,
          ventasTotal: 15,
          comprasTotal: 3,
        },
        {
          id: 3,
          username: 'maria_compras',
          email: 'maria@email.com',
          role: 'USUARIO',
          fechaRegistro: '2024-03-10',
          activo: true,
          productosTotal: 2,
          ventasTotal: 5,
          comprasTotal: 12,
        },
        {
          id: 4,
          username: 'carlos_inactivo',
          email: 'carlos@email.com',
          role: 'USUARIO',
          fechaRegistro: '2024-01-05',
          activo: false,
          productosTotal: 0,
          ventasTotal: 0,
          comprasTotal: 1,
        },
      ];

      setUsers(mockUsers);
      setStats({
        totalUsers: mockUsers.length,
        adminUsers: mockUsers.filter(u => u.role === 'ADMIN').length,
        activeUsers: mockUsers.filter(u => u.activo).length,
        inactiveUsers: mockUsers.filter(u => !u.activo).length,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleUserAction = (targetUser: UserInfo, action: string) => {
    Alert.alert(
      'Confirmar Acción',
      `¿Estás seguro de que quieres ${action} al usuario ${targetUser.username}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            Alert.alert('Info', `Acción "${action}" ejecutada para ${targetUser.username}`);
            // Aquí iría la lógica real de la API
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
          <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
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
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Estadísticas de Usuarios</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Usuarios</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🛡️</Text>
              <Text style={styles.statNumber}>{stats.adminUsers}</Text>
              <Text style={styles.statLabel}>Administradores</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statNumber}>{stats.activeUsers}</Text>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏸️</Text>
              <Text style={styles.statNumber}>{stats.inactiveUsers}</Text>
              <Text style={styles.statLabel}>Inactivos</Text>
            </View>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>👤 Lista de Usuarios ({users.length})</Text>
          
          <View style={styles.usersList}>
            {users.map((targetUser) => (
              <View key={targetUser.id} style={[
                styles.userCard,
                !targetUser.activo && styles.inactiveUserCard
              ]}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.username}>{targetUser.username}</Text>
                    <Text style={styles.userEmail}>{targetUser.email}</Text>
                    <Text style={styles.userDate}>
                      Registrado: {formatDate(targetUser.fechaRegistro)}
                    </Text>
                  </View>
                  
                  <View style={styles.userBadges}>
                    <View style={[
                      styles.roleBadge,
                      targetUser.role === 'ADMIN' ? styles.adminRoleBadge : styles.userRoleBadge
                    ]}>
                      <Text style={styles.roleText}>
                        {targetUser.role === 'ADMIN' ? '🛡️ ADMIN' : '👤 USER'}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.statusBadge,
                      targetUser.activo ? styles.activeBadge : styles.inactiveBadge
                    ]}>
                      <Text style={styles.statusText}>
                        {targetUser.activo ? 'ACTIVO' : 'INACTIVO'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* User Stats */}
                <View style={styles.userStats}>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatNumber}>{targetUser.productosTotal}</Text>
                    <Text style={styles.userStatLabel}>Productos</Text>
                  </View>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatNumber}>{targetUser.ventasTotal}</Text>
                    <Text style={styles.userStatLabel}>Ventas</Text>
                  </View>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatNumber}>{targetUser.comprasTotal}</Text>
                    <Text style={styles.userStatLabel}>Compras</Text>
                  </View>
                </View>

                {/* Actions */}
                {targetUser.id !== user?.id && (
                  <View style={styles.userActions}>
                    {targetUser.activo ? (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.suspendBtn]}
                        onPress={() => handleUserAction(targetUser, 'suspender')}
                      >
                        <Text style={styles.suspendBtnText}>⏸️ Suspender</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.activateBtn]}
                        onPress={() => handleUserAction(targetUser, 'activar')}
                      >
                        <Text style={styles.activateBtnText}>✅ Activar</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.manageBtn]}
                      onPress={() => {
                        Alert.alert(
                          'Gestionar Usuario',
                          'Opciones disponibles:',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Ver Productos', onPress: () => Alert.alert('Info', 'Funcionalidad próximamente') },
                            { text: 'Ver Actividad', onPress: () => Alert.alert('Info', 'Funcionalidad próximamente') },
                          ]
                        );
                      }}
                    >
                      <Text style={styles.manageBtnText}>⚙️ Gestionar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
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
    backgroundColor: '#9C27B0', // Purple for admin
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
    color: '#9C27B0',
    textAlign: 'center' as const,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },

  // Users Section
  usersSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  usersList: {
    gap: Spacing.md,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  inactiveUserCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
  },
  userHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: Spacing.md,
  },
  userInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  username: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  userDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  userBadges: {
    alignItems: 'flex-end' as const,
    gap: Spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Border.radius.sm,
  },
  adminRoleBadge: {
    backgroundColor: '#9C27B0',
  },
  userRoleBadge: {
    backgroundColor: Colors.primary,
  },
  roleText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Border.radius.sm,
  },
  activeBadge: {
    backgroundColor: Colors.success,
  },
  inactiveBadge: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },

  // User Stats
  userStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    backgroundColor: Colors.lightGray,
    borderRadius: Border.radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  userStat: {
    alignItems: 'center' as const,
  },
  userStatNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  userStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },

  // Actions
  userActions: {
    flexDirection: 'row' as const,
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Border.radius.md,
    alignItems: 'center' as const,
  },
  suspendBtn: {
    backgroundColor: Colors.warning,
  },
  suspendBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  activateBtn: {
    backgroundColor: Colors.success,
  },
  activateBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  manageBtn: {
    backgroundColor: Colors.primary,
  },
  manageBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
};