import axios, { AxiosResponse } from 'axios';

// Para desarrollo en Expo Go, usar la IP local de tu computadora
// Cambia 192.168.1.100 por tu IP local
const API_BASE_URL = 'http://192.168.1.100:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

interface ApiError {
  message: string;
  status: number;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error de conexión',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
};

interface ProductData {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  estado: string;
}

export const productService = {
  createProduct: async (productData: ProductData, token: string | null) => {
    try {
      if (!token) {
        throw new Error('Token de autenticación requerido');
      }

      const response = await api.post('/productos', productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al crear producto',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },

  getProducts: async (token: string | null) => {
    try {
      if (!token) {
        throw new Error('Token de autenticación requerido');
      }

      const response = await api.get('/productos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener productos',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },

  togglePublishProduct: async (productId: number, published: boolean, token: string | null) => {
    try {
      if (!token) {
        throw new Error('Token de autenticación requerido');
      }

      const response = await api.put(`/productos/${productId}/publish`, 
        { publicado: published },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al actualizar estado de publicación',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },

  getPublishedProducts: async () => {
    try {
      const response = await api.get('/productos/published');
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener productos publicados',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
};

// Servicios de ventas y reportes
export const salesService = {
  // Obtener ventas del usuario
  getUserSales: async (token: string, filter: string = 'all') => {
    try {
      const response = await api.get(`/ventas/usuario?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener ventas',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Obtener estadísticas de ventas
  getSalesStats: async (token: string) => {
    try {
      const response = await api.get('/ventas/estadisticas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener estadísticas',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Obtener reporte detallado de ventas
  getSalesReport: async (token: string, startDate?: string, endDate?: string) => {
    try {
      let url = '/ventas/reporte';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener reporte',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Obtener ventas por producto
  getProductSales: async (token: string, productId: number) => {
    try {
      const response = await api.get(`/ventas/producto/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener ventas del producto',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Marcar venta como completada
  completeSale: async (token: string, saleId: number) => {
    try {
      const response = await api.post(`/ventas/${saleId}/completar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al completar venta',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Cancelar venta
  cancelSale: async (token: string, saleId: number, reason: string) => {
    try {
      const response = await api.post(`/ventas/${saleId}/cancelar`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al cancelar venta',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
};

// Servicios de compras
export const purchaseService = {
  // Obtener compras del usuario
  getUserPurchases: async (token: string, filter: string = 'all') => {
    try {
      const response = await api.get(`/compras/usuario?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener compras',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Obtener estadísticas de compras
  getPurchaseStats: async (token: string) => {
    try {
      const response = await api.get('/compras/estadisticas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener estadísticas de compras',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Obtener detalle de una compra específica
  getPurchaseDetail: async (token: string, purchaseId: number) => {
    try {
      const response = await api.get(`/compras/${purchaseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener detalle de compra',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Crear nueva compra
  createPurchase: async (token: string, purchaseData: {
    productoId: number;
    cantidad: number;
    metodoPago: string;
    direccionEnvio?: string;
  }) => {
    try {
      const response = await api.post('/compras', purchaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al crear compra',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Confirmar recepción de compra
  confirmReceiptPurchase: async (token: string, purchaseId: number) => {
    try {
      const response = await api.post(`/compras/${purchaseId}/confirmar-recepcion`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al confirmar recepción',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Cancelar compra (si está pendiente)
  cancelPurchase: async (token: string, purchaseId: number, reason: string) => {
    try {
      const response = await api.post(`/compras/${purchaseId}/cancelar`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al cancelar compra',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
  
  // Obtener historial de compras por producto
  getPurchasesByProduct: async (token: string, productId: number) => {
    try {
      const response = await api.get(`/compras/producto/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Error al obtener compras del producto',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
};

export default api;