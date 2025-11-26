import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Alert
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Colors, Typography, Spacing, Border, Shadows } from '../styles/GlobalStyles';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  const getMenuItems = () => {
    const commonItems = [
      {
        title: 'Marketplace',
        icon: '🛒',
        description: user?.role === 'ADMIN' ? 'Supervisar marketplace' : 'Explorar y comprar productos',
        onPress: () => navigation.navigate('PublishedProducts')
      },
    ];

    if (user?.role === 'ADMIN') {
      return [
        ...commonItems,
        {
          title: 'Gestión de Usuarios',
          icon: '👥',
          description: 'Administrar usuarios del sistema',
          onPress: () => navigation.navigate('AdminUsers')
        },
        {
          title: 'Reportes Generales',
          icon: '📊',
          description: 'Ver estadísticas globales del sistema',
          onPress: () => navigation.navigate('SalesReport')
        },
        {
          title: 'Gestión de Productos',
          icon: '📦',
          description: 'Supervisar todos los productos',
          onPress: () => navigation.navigate('ProductList')
        },
        {
          title: 'Moderación',
          icon: '🛡️',
          description: 'Herramientas de moderación',
          onPress: () => Alert.alert('Info', 'Panel de moderación próximamente')
        },
        {
          title: 'Configuración Admin',
          icon: '⚙️',
          description: 'Configuración del sistema',
          onPress: () => Alert.alert('Info', 'Configuraciones próximamente')
        },
      ];
    } else {
      return [
        {
          title: 'Crear Producto',
          icon: '📦',
          description: 'Agregar nuevo producto al catálogo',
          onPress: () => navigation.navigate('CreateProduct')
        },
        {
          title: 'Mis Productos',
          icon: '📋',
          description: 'Ver lista de productos creados',
          onPress: () => navigation.navigate('ProductList')
        },
        ...commonItems,
        {
          title: 'Reportes de Ventas',
          icon: '📊',
          description: 'Ver estadísticas y reportes de ventas',
          onPress: () => navigation.navigate('SalesReport')
        },
        {
          title: 'Mis Compras',
          icon: '🧾',
          description: 'Ver historial de productos comprados',
          onPress: () => navigation.navigate('Purchases')
        },
        {
          title: 'Configuración',
          icon: '⚙️',
          description: 'Configurar aplicación',
          onPress: () => Alert.alert('Info', 'Configuraciones próximamente')
        },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            <Text style={styles.userText}>{user?.username || 'Usuario'}</Text>
            <Text style={styles.roleText}>Rol: {user?.role || 'N/A'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProduct')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {user?.role === 'ADMIN' ? (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>124</Text>
                <Text style={styles.statLabel}>Total Productos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>47</Text>
                <Text style={styles.statLabel}>Usuarios Activos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Reportes Pendientes</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Mis Productos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>15</Text>
                <Text style={styles.statLabel}>Ventas Este Mes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Compras Recientes</Text>
              </View>
            </>
          )}
        </View>

        {/* Role Info Banner */}
        <View style={[
          styles.roleBanner,
          user?.role === 'ADMIN' && styles.adminBanner
        ]}>
          <Text style={styles.roleBannerIcon}>
            {user?.role === 'ADMIN' ? '🛡️' : '🔄'}
          </Text>
          <View style={styles.roleBannerContent}>
            <Text style={styles.roleBannerTitle}>
              {user?.role === 'ADMIN' ? 'Modo Administrador' : 'Doble Funcionalidad'}
            </Text>
            <Text style={styles.roleBannerText}>
              {user?.role === 'ADMIN' 
                ? 'Tienes acceso completo para supervisar y moderar la plataforma'
                : 'Puedes vender tus productos Y comprar de otros usuarios'
              }
            </Text>
          </View>
        </View>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>Menú Principal</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuCard}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
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
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  welcomeText: {
    fontSize: Typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  roleText: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.md,
    borderRadius: Border.radius.round,
  },
  logoutIcon: {
    fontSize: Typography.fontSize.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginVertical: Spacing.lg,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    alignItems: 'center' as const,
    flex: 1,
    marginHorizontal: Spacing.xs,
    ...Shadows.light,
  },
  statNumber: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  menuContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    alignItems: 'center' as const,
    width: '48%' as const,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  menuIconContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: Border.radius.round,
    width: 60,
    height: 60,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: Spacing.md,
  },
  menuIcon: {
    fontSize: 30,
  },
  menuTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center' as const,
    marginBottom: Spacing.xs,
  },
  menuDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 16,
  },
  fab: {
    position: 'absolute' as const,
    bottom: Spacing.xl,
    right: Spacing.lg,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...Shadows.heavy,
    zIndex: 1000,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Role Banner
  roleBanner: {
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    ...Shadows.light,
  },
  roleBannerIcon: {
    fontSize: Typography.fontSize.xxl,
    marginRight: Spacing.md,
  },
  roleBannerContent: {
    flex: 1,
  },
  roleBannerTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  roleBannerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  adminBanner: {
    backgroundColor: '#E8F5E8', // Light green background for admin
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50', // Green accent for admin
  },
};