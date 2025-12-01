import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image } from 'react-native';
import { productService, categoryService, getFullUrl } from '../services/api';
import ComuctivaLogo from '../components/ComuctivaLogo';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenUrl?: string;
  fechaPublicacion: string;
}
interface Categoria {
  id: number;
  nombre: string;
}

const HomeScreen = ({ navigation, route }: any) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenamiento, setOrdenamiento] = useState<'reciente' | 'nombre'>('reciente');
  
  // Obtener parámetros de navegación para saber si está logueado
  const isLoggedIn = route?.params?.isLoggedIn || false;
  const userDocument = route?.params?.userDocument || '';
  // userName viene desde el login si está disponible; si no, usar el documento
  const userName = route?.params?.userName || userDocument || '';

  useEffect(() => {
    handleCategoriaChange(null);
    // También carga las categorías
    // categoryService.getAll().then(res => setCategorias(res.data));
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productosRes, categoriasRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
      setError(null);
    } catch (err: any) {
      // Mostrar el error exacto devuelto por el backend
      const backendError = err?.response?.data?.message || err?.response?.data || err?.message || 'Error al cargar los datos';
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaChange = async (categoriaId: number | null) => {
    setSelectedCategoria(categoriaId);
    setSearchTerm('');
    try {
      setLoading(true);
      if (categoriaId === null) {
        const response = await productService.getAll();
        setProductos(response.data);
      } else {
        const response = await productService.getByCategory(categoriaId);
        setProductos(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Error al filtrar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    setSelectedCategoria(null);
    if (value.trim() === '') {
      loadInitialData();
      return;
    }
    if (value.length < 2) return;
    try {
      setLoading(true);
      // Suponiendo que hay un endpoint de búsqueda, si no, filtra localmente
      const response = await productService.getAll();
      const productosFiltrados = response.data.filter((p: Producto) =>
        p.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setProductos(productosFiltrados);
      setError(null);
    } catch (err) {
      setError('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  // Ordenar productos
  const productosOrdenados = [...productos].sort((a, b) => {
    switch (ordenamiento) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      case 'reciente':
      default:
        return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime();
    }
  });

  const renderProducto = ({ item }: { item: Producto }) => (
    <View style={styles.modernCard}>
      <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { id: item.id })} activeOpacity={0.8} style={{ flex: 1 }}>
        <View style={styles.modernImageContainer}>
          {item.imagenUrl ? (
            <Image
              source={{ uri: getFullUrl(item.imagenUrl) }}
              style={styles.modernProductImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderIcon}>📱</Text>
            </View>
          )}
          <TouchableOpacity style={styles.favoriteButton}>
            <Text style={styles.favoriteIcon}>🤍</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modernCardContent}>
          <Text style={styles.modernProductName} numberOfLines={2}>{item.nombre}</Text>
          <Text style={styles.modernProductPrice}>${item.precio.toLocaleString()}</Text>
          <TouchableOpacity style={styles.addToCartButton}>
            <Text style={styles.addToCartText}>Agregar al carrito</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {isLoggedIn ? (
          // Vista cuando el usuario está logueado
          <>
            <View style={styles.headerLoggedIn}>
              <View style={styles.logoMiniWrapper}>
                <ComuctivaLogo size="small" />
              </View>
              <View style={styles.titleContainer}>
                <View style={styles.loggedInBrandContainer}>
                  <Text style={[styles.title, styles.titleLoggedIn]}>COMUCTIVA</Text>
                  <View style={styles.smallUnderline} />
                </View>
                <Text style={styles.subtitleLoggedIn}>¡Bienvenido de vuelta!</Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userText}>Usuario: {userName}</Text>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={() => navigation.replace('Home')}
              >
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Vista cuando el usuario NO está logueado
          <>
            <View style={styles.titleWrapper}>
              <Text style={styles.welcomeText}>Bienvenido a</Text>
              <View style={styles.brandContainer}>
                <Text style={[styles.title, styles.brandTitle]}>COMUCTIVA</Text>
                <View style={styles.underline} />
              </View>
            </View>
            <Text style={styles.subtitle}>Encuentra los mejores productos al mejor precio</Text>

            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                style={styles.authButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.authButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authButton, styles.registerButton]}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={[styles.authButtonText, styles.registerButtonText]}>Registrarse</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Buscar productos..."
        value={searchTerm}
        onChangeText={handleSearch}
      />

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={[{ id: null, nombre: 'Todas' }, ...categorias]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoriaBtn, selectedCategoria === item.id && styles.categoriaBtnActive]}
              onPress={() => handleCategoriaChange(item.id)}
            >
              <Text style={selectedCategoria === item.id ? styles.categoriaTextActive : styles.categoriaText}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.ordenamientoBox}>
          <Text>Ordenar:</Text>
          <TouchableOpacity onPress={() => setOrdenamiento('reciente')}><Text style={ordenamiento==='reciente'?styles.ordenActive:undefined}>Recientes</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setOrdenamiento('nombre')}><Text style={ordenamiento==='nombre'?styles.ordenActive:undefined}>Nombre</Text></TouchableOpacity>
        </View>
      </View>

      {error && (
        <TouchableOpacity onPress={() => setError(null)}>
          <Text style={styles.error}>{error}</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 30 }} />
      ) : productosOrdenados.length > 0 ? (
        <FlatList
          data={productosOrdenados}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProducto}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 8 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No se encontraron productos</Text>
          <Text>Intenta con otra búsqueda o categoría</Text>
        </View>
      )}
      </View>
      
      {/* Barra de navegación inferior */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navLabel}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navLabel}>Carrito</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Buscar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  authButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  authButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  registerButtonText: {
    color: '#22c55e',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1e293b',
    textShadowColor: 'rgba(34, 197, 94, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 2,
    fontFamily: 'System',
  },
  titleLoggedIn: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'left',
    color: '#22c55e',
    textShadowColor: '#16a34a',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 17,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  subtitleLoggedIn: {
    fontSize: 16,
    color: '#16a34a',
    marginBottom: 12,
    textAlign: 'left',
    fontWeight: '600',
    fontStyle: 'italic',
    marginTop: 4,
  },
  userInfo: {
    backgroundColor: '#f0fdf4', // Fondo verde muy claro
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    color: '#15803d', // Verde oscuro
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc2626', // Rojo
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  categoriaBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoriaBtnActive: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  categoriaText: {
    color: '#333',
  },
  categoriaTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ordenamientoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ordenActive: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 4,
    textAlign: 'center',
  },
  productDesc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  // Nuevos estilos modernos para las tarjetas
  modernCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    flex: 1,
    maxWidth: '45%',
  },
  modernImageContainer: {
    position: 'relative',
    height: 150,
    backgroundColor: '#f8fafc',
  },
  modernProductImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
    opacity: 0.5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
  },
  modernCardContent: {
    padding: 12,
  },
  modernProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 18,
  },
  modernProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 8,
  },
  addToCartButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  // Navegación inferior
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#22c55e',
    fontWeight: '600',
  },
  // Estilos para el logo mini en el header
  headerLoggedIn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  logoMiniWrapper: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleContainer: {
    flex: 1,
  },
  // Estilos mejorados para el título
  titleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#22c55e',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textShadowColor: '#16a34a',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    marginBottom: 4,
  },
  underline: {
    width: 80,
    height: 4,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    marginTop: 4,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  loggedInBrandContainer: {
    alignItems: 'flex-start',
  },
  smallUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    marginTop: 2,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default HomeScreen;
