import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image } from 'react-native';
import { productService, categoryService } from '../services/api';

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

const HomeScreen = ({ navigation }: any) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenamiento, setOrdenamiento] = useState<'reciente' | 'nombre'>('reciente');

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
      console.log('Respuesta productos:', productosRes.data);
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
      setError(null);
    } catch (err: any) {
      // Mostrar el error exacto devuelto por el backend
      const backendError = err?.response?.data?.message || err?.response?.data || err?.message || 'Error al cargar los datos';
      setError(backendError);
      console.log('Error productos:', err);
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
    <View style={styles.card}>
      {item.imagenUrl ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imagenUrl }} style={styles.productImage} resizeMode="cover" />
        </View>
      ) : null}
      <Text style={styles.productName}>{item.nombre}</Text>
      <Text style={styles.productPrice}>${item.precio}</Text>
      <Text style={styles.productDesc}>{item.descripcion}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Comuctiva</Text>
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
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
      ) : productosOrdenados.length > 0 ? (
        <FlatList
          data={productosOrdenados}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProducto}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No se encontraron productos</Text>
          <Text>Intenta con otra búsqueda o categoría</Text>
        </View>
      )}
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
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  registerButtonText: {
    color: '#007bff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  categoriaBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  categoriaBtnActive: {
    backgroundColor: '#007bff',
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
    color: '#007bff',
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
});

export default HomeScreen;
