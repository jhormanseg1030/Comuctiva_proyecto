import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);

// Categorías
export const getCategorias = () => api.get('/categorias');
export const getCategoria = (id) => api.get(`/categorias/${id}`);
export const createCategoria = (data) => api.post('/categorias', data);
export const updateCategoria = (id, data) => api.put(`/categorias/${id}`, data);
export const changeEstadoCategoria = (id, activo) => api.put(`/categorias/${id}/estado?activo=${activo}`);
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`);

// Subcategorías
export const getSubcategorias = () => api.get('/subcategorias');
export const getSubcategoria = (id) => api.get(`/subcategorias/${id}`);
export const getSubcategoriasByCategoria = (categoriaId) => api.get(`/subcategorias/categoria/${categoriaId}`);
export const createSubcategoria = (data) => api.post('/subcategorias', data);
export const updateSubcategoria = (id, data) => api.put(`/subcategorias/${id}`, data);
export const changeEstadoSubcategoria = (id, activo) => api.put(`/subcategorias/${id}/estado?activo=${activo}`);
export const deleteSubcategoria = (id) => api.delete(`/subcategorias/${id}`);

// Productos
export const getProductos = () => api.get('/productos');
export const getProducto = (id) => api.get(`/productos/${id}`);
export const getProductosByCategoria = (categoriaId) => api.get(`/productos/categoria/${categoriaId}`);
export const getProductosBySubcategoria = (subcategoriaId) => api.get(`/productos/subcategoria/${subcategoriaId}`);
export const buscarProductos = (keyword) => api.get(`/productos/buscar?keyword=${keyword}`);

// Carrito
export const getCarrito = () => api.get('/carrito');
export const addToCarrito = (productoId, cantidad) => api.post(`/carrito/agregar?productoId=${productoId}&cantidad=${cantidad}`);
export const updateCarrito = (carritoId, cantidad) => api.put(`/carrito/${carritoId}?cantidad=${cantidad}`);
export const removeFromCarrito = (carritoId) => api.delete(`/carrito/${carritoId}`);
export const clearCarrito = () => api.delete('/carrito/vaciar');

// Pedidos
export const getPedidos = () => api.get('/pedidos/mis-pedidos');
export const getPedido = (id) => api.get(`/pedidos/${id}`);
export const createPedido = (pedidoData) => api.post(`/pedidos/crear?direccionEnvio=${encodeURIComponent(pedidoData.direccionEntrega)}&metodoPago=${pedidoData.metodoPago}&costoFlete=${pedidoData.costoFlete || 0}`);
export const cancelPedido = (id) => api.put(`/pedidos/${id}/cancelar`);

// Ventas
export const getVentas = () => api.get('/pedidos/mis-ventas');

// Productos del usuario
export const getProductosByUsuario = (numeroDocumento) => api.get(`/productos/usuario/${numeroDocumento}`);
export const createProducto = (productoData) => api.post('/productos/con-imagen', productoData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProducto = (id, productoData) => api.put(`/productos/${id}/con-imagen`, productoData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProducto = (id, force = false) => api.delete(`/productos/${id}${force ? '?force=true' : ''}`);
export const cambiarEstadoProducto = (id, activo) => api.put(`/productos/${id}/estado?activo=${activo}`, {}, {
  headers: { 'Accept': 'application/json' }
});
export const archiveImagenProducto = (id) => api.put(`/productos/${id}/imagen/archive`);
export const restoreImagenProducto = (id) => api.put(`/productos/${id}/imagen/restore`);
export const deleteImagenProducto = (id) => api.delete(`/productos/${id}/imagen`);

// Promociones
export const getPromociones = () => api.get('/promociones');
export const getPromocionesActivas = () => api.get('/promociones/activas');
export const getPromocionesVigentes = () => api.get('/promociones/vigentes');
export const getPromocionesUsuario = (numeroDocumento) => api.get(`/promociones/creador/${numeroDocumento}`);
export const createPromocion = (promocionData) => api.post('/promociones', promocionData);
export const updatePromocion = (id, promocionData) => api.put(`/promociones/${id}`, promocionData);
export const deletePromocion = (id) => api.delete(`/promociones/${id}`);
export const cambiarEstadoPromocion = (id, activo) => api.put(`/promociones/${id}/estado?activo=${activo}`);

// Comentarios
export const getComentariosByProducto = (productoId) => api.get(`/comentarios/producto/${productoId}`);
export const createComentario = (comentarioData) => api.post('/comentarios', comentarioData);
export const updateComentario = (id, comentarioData) => api.put(`/comentarios/${id}`, comentarioData);
export const deleteComentario = (id) => api.delete(`/comentarios/${id}`);
// Admin - moderación
export const getComentariosAdmin = (params) => api.get('/comentarios/admin', { params });
export const deleteComentarioAdmin = (id) => api.delete(`/comentarios/admin/${id}`);

// Usuario
export const getUsuario = (numeroDocumento) => api.get(`/usuarios/${numeroDocumento}`);
export const updateUsuario = (numeroDocumento, userData) => api.put(`/usuarios/${numeroDocumento}`, userData);
export const cambiarPassword = (numeroDocumento, passwordData) => api.put(`/usuarios/${numeroDocumento}/cambiar-password`, passwordData);

// Admin
export const getAdminSummary = () => api.get('/admin/summary');
export const getAllUsuarios = () => api.get('/usuarios');
export const cambiarRolUsuario = (numeroDocumento, rol) => api.put(`/usuarios/${numeroDocumento}/rol?rol=${rol}`);
export const cambiarEstadoUsuario = (numeroDocumento, activo) => api.put(`/usuarios/${numeroDocumento}/estado?activo=${activo}`);
export const deleteUsuario = (numeroDocumento) => api.delete(`/usuarios/${numeroDocumento}`);

// Pedidos (admin)
export const getAllPedidos = () => api.get('/pedidos');
export const actualizarEstadoPedido = (id, estado) => api.put(`/pedidos/${id}/estado?estado=${encodeURIComponent(estado)}`);

export default api;
