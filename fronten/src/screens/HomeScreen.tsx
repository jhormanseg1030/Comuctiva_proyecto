import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productService, categoryService, getFullUrl, authService } from '../services/api';
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
  const [favorites, setFavorites] = useState<Producto[]>([]);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const isFocused = useIsFocused();
  
  // Obtener parámetros de navegación para saber si está logueado
  const isLoggedIn = route?.params?.isLoggedIn || false;
  const userDocument = route?.params?.userDocument || '';
  // userName viene desde el login si está disponible; si no, usar el documento
  const userName = route?.params?.userName || userDocument || '';

  const GLOBAL_FALLBACK_KEY = '@comuctiva_favorites_v1';

  const getFavoritesKey = () => {
    const id = route?.params?.userDocument || route?.params?.userName || 'guest';
    return `@comuctiva_favorites_${id}`;
  };

  useEffect(() => {
    handleCategoriaChange(null);
    // También carga las categorías
    // categoryService.getAll().then(res => setCategorias(res.data));
    // Reload favorites when the user params change or when the screen gains focus
    if (isFocused) loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.userDocument, route?.params?.userName, isFocused]);

  const loadFavorites = async () => {
    try {
      const key = getFavoritesKey();
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        setFavorites(JSON.parse(raw));
        return;
      }
      // try guest favorites (anonymous) and merge if user logged in
      const guestRaw = await AsyncStorage.getItem('@comuctiva_favorites_guest');
      if (guestRaw && key !== '@comuctiva_favorites_guest') {
        const guestList: Producto[] = JSON.parse(guestRaw);
        // if user has no favorites yet, adopt guest ones
        const existing = [] as Producto[];
        const merged = [...guestList, ...existing]
          .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
        if (merged.length > 0) {
          setFavorites(merged);
          await AsyncStorage.setItem(key, JSON.stringify(merged));
          // optionally remove guest key to avoid duplicate merges
          await AsyncStorage.removeItem('@comuctiva_favorites_guest');
          return;
        }
      }
      // fallback/legacy migration
      const legacy = await AsyncStorage.getItem(GLOBAL_FALLBACK_KEY);
      if (legacy) {
        setFavorites(JSON.parse(legacy));
        await AsyncStorage.setItem(key, legacy);
        await AsyncStorage.removeItem(GLOBAL_FALLBACK_KEY);
      } else {
        setFavorites([]);
      }
    } catch (e) {
      console.warn('Error cargando favoritos', e);
    }
  };

  const persistFavorites = async (next: Producto[]) => {
    try {
      const key = getFavoritesKey();
      await AsyncStorage.setItem(key, JSON.stringify(next));
    } catch (e) {
      console.warn('Error guardando favoritos', e);
    }
  };

  const toggleFavorite = async (p: Producto) => {
    try {
      const exists = favorites.some(f => f.id === p.id);
      let next: Producto[];
      if (exists) next = favorites.filter(f => f.id !== p.id);
      else next = [p, ...favorites];
      setFavorites(next);
      await persistFavorites(next);
    } catch (e) {
      console.warn('toggleFavorite error', e);
    }
  };

  const removeFavoriteLocal = async (id: number) => {
    try {
      const next = favorites.filter(f => f.id !== id);
      setFavorites(next);
      await persistFavorites(next);
    } catch (e) {
      console.warn('removeFavoriteLocal error', e);
    }
  };

  const addToCart = async (product: Producto) => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];
      
      const existingItemIndex = cart.findIndex((item: any) => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Si el producto ya existe, incrementa la cantidad
        cart[existingItemIndex].cantidad += 1;
      } else {
        // Si no existe, lo agrega al carrito
        const cartItem = {
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagenUrl ? getFullUrl(product.imagenUrl) : '',
          cantidad: 1,
          descripcion: product.descripcion
        };
        cart.push(cartItem);
      }
      
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Producto agregado', `${product.nombre} se agregó al carrito`);
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      Alert.alert('Error', 'No se pudo agregar el producto al carrito');
    }
  };

  const clearFavoritesLocal = () => {
    // Clear only local state so favorites are not visible when logged out,
    // but keep them persisted for the user so they reappear after login.
    setFavorites([]);
    setShowFavorites(false);
  };

  const isFavorite = (id: number) => favorites.some(f => f.id === id);

  const goToFavorites = () => {
    // Mostrar la vista de favoritos dentro del HomeScreen
    setShowFavorites(true);
  };

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
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
      >
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
        </View>
      </TouchableOpacity>

      {/* Favorito en overlay (captura su propio onPress) */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={async () => {
          try {
            await toggleFavorite(item);
          } catch (e) {
            console.warn('Error toggling favorite', e);
          }
        }}
      >
        <Text style={styles.favoriteIcon}>{isFavorite(item.id) ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      <View style={styles.modernCardContent}>
        <Text style={styles.modernProductName} numberOfLines={2}>{item.nombre}</Text>
        <Text style={styles.modernProductPrice}>${item.precio.toLocaleString()}</Text>
        <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item)}>
          <Text style={styles.addToCartText}>Agregar al carrito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {showUserMenu && (
        <TouchableWithoutFeedback onPress={() => setShowUserMenu(false)}>
          <View style={styles.menuBackdrop} />
        </TouchableWithoutFeedback>
      )}
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

      {showFavorites ? (
        // Mostrar lista de favoritos inline
        favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tienes favoritos</Text>
            <Text>Marca productos con el corazón para agregarlos aquí.</Text>
          </View>
        ) : (
          <FlatList
            key={`numCols-1`}
            data={favorites}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {item.imagenUrl ? (
                    <Image source={{ uri: getFullUrl(item.imagenUrl) }} style={{ width: 90, height: 90, borderRadius: 8 }} />
                  ) : (
                    <View style={{ width: 90, height: 90, borderRadius: 8, backgroundColor: '#e2e8f0' }} />
                  )}
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={2}>{item.nombre}</Text>
                    <Text style={{ color: '#22c55e', fontWeight: '700', marginTop: 6 }}>${item.precio.toLocaleString()}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
                      <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item)}>
                        <Text style={styles.addToCartText}>Agregar al carrito</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.addToCartButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e11d48' }]} onPress={() => removeFavoriteLocal(item.id)}>
                        <Text style={{ color: '#e11d48', fontWeight: '600' }}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 8 }}
          />
        )
      ) : loading ? (
        <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 30 }} />
      ) : productosOrdenados.length > 0 ? (
        <FlatList
          key={`numCols-2`}
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
      
      {/* Barra de navegación inferior y menú de usuario */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={[styles.navItem, !showFavorites && styles.navItemActive]}
          onPress={() => setShowFavorites(false)}
        >
          <Text style={[styles.navIcon, !showFavorites && styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, !showFavorites && styles.navLabelActive]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, showFavorites && styles.navItemActive]}
          onPress={() => setShowFavorites(true)}
        >
          <Text style={[styles.navIcon, showFavorites && styles.navIconActive]}>❤️</Text>
          <Text style={[styles.navLabel, showFavorites && styles.navLabelActive]}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navLabel}>Carrito</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Buscar')}
        >
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Buscar</Text>
        </TouchableOpacity>
        {isLoggedIn && (
          <TouchableOpacity
            style={[styles.navItem, styles.navItemActive]}
            onPress={() => navigation.navigate('UsuarioMenuScreen')}
          >
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: 28, height: 28, borderRadius: 14, marginBottom: 4 }}
            />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Usuario</Text>
          </TouchableOpacity>
        )}
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
  smallAuthButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 8,
    elevation: 2,
  },
  userInfoWrapper: {
    position: 'relative',
  },
  userButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  publishBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#22c55e',
    marginLeft: 8,
  },
  publishBtnText: {
    color: '#22c55e',
  },
  userMenu: {
    position: 'absolute',
    top: '100%',
    right: 12,
    left: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e6eef0',
    elevation: 6,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 990,
  },
  userMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userMenuText: {
    fontSize: 15,
    color: '#0f172a',
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
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
