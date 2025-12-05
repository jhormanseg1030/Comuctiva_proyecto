import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia la IP por la de tu PC si usas dispositivo físico
const API_URL = 'http://172.16.102.152:8080/api'; // <-- Reemplaza por tu IP local
// Para emulador Android puedes usar: 'http://10.0.2.2:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token JWT a cada request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('🔑 Token agregado al request:', config.url);
    }
    return config;
  },
  (error) => {
    // console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
// api.interceptors.response.use(
//   (response) => {
//     console.log('✅ Respuesta exitosa:', response.config.url, response.status);
//     return response;
//   },
//   (error) => {
//     console.error('❌ Error en respuesta:', error.config?.url, error.response?.status, error.response?.data);
//     return Promise.reject(error);
//   }
// );

export const authService = {
  login: async (numeroDocumento: string, password: string) => {
    // El cuerpo debe ser igual al de la web
    const response = await api.post('/auth/login', { numeroDocumento, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  register: async (data: any) => {
    // El endpoint de registro es /auth/register
    const response = await api.post('/auth/register', data);
    return response.data;
  }
};

// Base host (sin el sufijo /api) y helper para construir URLs completas de recursos (por ejemplo imágenes)
export const API_BASE_HOST = API_URL.replace(/\/api\/?$/, '');

import { Platform } from 'react-native';

export const getFullUrl = (path?: string | null) => {
  if (!path) return '';
  // Si path es URL absoluta y contiene localhost/127.0.0.1, en Android emulador reemplazar por 10.0.2.2
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const u = new URL(path);
      // If the returned URL uses localhost/127.0.0.1, replace host+port with our API_BASE_HOST
      if (/localhost|127\.0\.0\.1/.test(u.hostname)) {
        // API_BASE_HOST already contains protocol and optional port
        // preserve the pathname and search from the original URL
        return `${API_BASE_HOST}${u.pathname}${u.search || ''}`;
      }
    } catch (e) {
      // if URL parsing fails, fall back to returning original path
      return path;
    }
    return path;
  }

  // Si no es URL absoluta, construir una a partir del host de la API
  const sep = path.startsWith('/') ? '' : '/';
  let host = API_BASE_HOST;
  // En emulador Android clásico, si el host es localhost o 127.0.0.1, usar 10.0.2.2
  if (Platform.OS === 'android' && /localhost|127\.0\.0\.1/.test(host)) {
    host = host.replace(/localhost|127\.0\.0\.1/, '10.0.2.2');
  }
  return `${host}${sep}${path}`;
};

export const userService = {
  getAll: () => api.get('/usuarios'),
  getById: (id: number) => api.get(`/usuarios/${id}`),
  create: (data: any) => api.post('/usuarios', data),
  update: (id: number, data: any) => api.put(`/usuarios/${id}`, data),
  delete: (id: number) => api.delete(`/usuarios/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categorias'),
  getById: (id: number) => api.get(`/categorias/${id}`),
  create: (data: any) => api.post('/categorias', data),
  update: (id: number, data: any) => api.put(`/categorias/${id}`, data),
  delete: (id: number) => api.delete(`/categorias/${id}`),
};

export const subcategoryService = {
  getAll: () => api.get('/subcategorias'),
  getByCategory: (categoryId: number) => api.get(`/subcategorias/categoria/${categoryId}`),
  getById: (id: number) => api.get(`/subcategorias/${id}`),
  create: (data: any) => api.post('/subcategorias', data),
  update: (id: number, data: any) => api.put(`/subcategorias/${id}`, data),
  delete: (id: number) => api.delete(`/subcategorias/${id}`),
};

export const productService = {
  getAll: () => api.get('/productos'),
  getByCategory: (categoryId: number) => api.get(`/productos/categoria/${categoryId}`),
  getBySubcategory: (subcategoryId: number) => api.get(`/productos/subcategoria/${subcategoryId}`),
  getById: (id: number) => api.get(`/productos/${id}`),
  create: (data: any) => api.post('/productos', data),
  // Create product with image (multipart/form-data)
  createWithImage: (formData: FormData) => api.post('/productos/con-imagen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: number, data: any) => api.put(`/productos/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  // Obtener comentarios de un producto (ajustado a la ruta correcta)
  getComentarios: (id: number) => api.get(`/comentarios/producto/${id}`),
  // Crear comentario/reseña de un producto
  crearComentario: (id: number, data: any) => api.post(`/productos/${id}/comentarios`, data),
};

export const statsService = {
  getStats: () => api.get('/stats'),
};

// Servicios del carrito (backend)
export const cartService = {
  getCart: () => {
    console.log('🔄 CartService: Obteniendo carrito');
    return api.get('/carrito');
  },
  addToCart: (productoId: number, cantidad: number = 1) => {
    console.log(`🔄 CartService: Agregando producto ${productoId}, cantidad: ${cantidad}`);
    const url = `/carrito/agregar?productoId=${productoId}&cantidad=${cantidad}`;
    console.log(`🔄 CartService: URL completa: ${API_URL}${url}`);
    return api.post(url);
  },
  updateCartItem: (carritoId: number, cantidad: number) => {
    console.log(`🔄 CartService: Actualizando item ${carritoId}, cantidad: ${cantidad}`);
    return api.put(`/carrito/${carritoId}?cantidad=${cantidad}`);
  },
  removeFromCart: (carritoId: number) => {
    console.log(`🔄 CartService: Eliminando item ${carritoId}`);
    return api.delete(`/carrito/${carritoId}`);
  },
  clearCart: () => {
    console.log('🔄 CartService: Limpiando carrito completo');
    return api.delete('/carrito/vaciar');
  },
};

// Servicios de pedidos
export const pedidosService = {
  getMisPedidos: () => api.get('/pedidos/mis-pedidos'),
  getPedido: (id: number) => api.get(`/pedidos/${id}`),
  crearPedido: (pedidoData: any) => 
    api.post(`/pedidos/crear?direccionEnvio=${encodeURIComponent(pedidoData.direccionEntrega)}&metodoPago=${pedidoData.metodoPago}&costoFlete=${pedidoData.costoFlete || 0}`),
  cancelarPedido: (id: number) => api.put(`/pedidos/${id}/cancelar`),
};

export default api;