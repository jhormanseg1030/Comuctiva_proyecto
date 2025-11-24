import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCarrito, addToCarrito, updateCarrito, removeFromCarrito, clearCarrito } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [initialized, setInitialized] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const loadCart = async () => {
    if (!isAuthenticated() || !user) {
      console.log('🚫 No hay usuario autenticado, limpiando carrito');
      setCart([]);
      return;
    }

    try {
      setLoading(true);
      console.log('📥 Cargando carrito para usuario:', user.numeroDocumento);
      const response = await getCarrito();
      // El backend devuelve { items, total, cantidadItems }
      setCart(response.data.items || []);
      console.log('✅ Carrito cargado:', response.data.items?.length || 0, 'items');
    } catch (error) {
      console.error('❌ Error al cargar carrito:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // Detectar cambio de usuario y recargar carrito
  useEffect(() => {
    // Esperar a que AuthContext termine de cargar
    if (authLoading) {
      console.log('⏳ Esperando a que AuthContext cargue...');
      return;
    }

    const userDoc = user?.numeroDocumento || null;
    
    console.log('🔍 useEffect disparado - currentUser:', currentUser, 'userDoc:', userDoc, 'initialized:', initialized);
    
    // Si es la primera vez y no hay usuario, solo marcar como inicializado
    if (!initialized) {
      setInitialized(true);
      setCurrentUser(userDoc);
      if (userDoc) {
        console.log('🎯 Carga inicial para usuario:', userDoc);
        loadCart();
      } else {
        console.log('🎯 Carga inicial sin usuario');
      }
      return;
    }
    
    // Solo procesar si realmente cambió el usuario
    if (userDoc !== currentUser) {
      console.log('🔄 Cambio de usuario detectado:', currentUser, '→', userDoc);
      
      // Actualizar el usuario actual
      setCurrentUser(userDoc);
      
      // Limpiar carrito
      setCart([]);
      
      if (userDoc) {
        // Nuevo usuario logueado
        console.log('👤 Cargando carrito para nuevo usuario:', userDoc);
        setTimeout(() => {
          loadCart();
        }, 100);
      } else {
        // Usuario cerró sesión
        console.log('🚫 Usuario cerró sesión, carrito vacío');
      }
    }
  }, [user, authLoading]);

  // Escuchar eventos de login/logout para actualizar carrito
  useEffect(() => {
    const handleLogin = () => {
      console.log('🔑 Evento login detectado');
      // Limpiar carrito primero
      setCart([]);
      // Luego cargar el nuevo
      setTimeout(() => loadCart(), 500);
    };
    
    const handleLogout = () => {
      console.log('🚪 Evento logout detectado');
      setCart([]);
      setCurrentUser(null);
    };
    
    window.addEventListener('login', handleLogin);
    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const addItem = async (productoId, cantidad = 1) => {
    try {
      await addToCarrito(productoId, cantidad);
      await loadCart();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al agregar al carrito' 
      };
    }
  };

  const updateItem = async (carritoId, cantidad) => {
    try {
      await updateCarrito(carritoId, cantidad);
      await loadCart();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar carrito' 
      };
    }
  };

  const removeItem = async (carritoId) => {
    try {
      await removeFromCarrito(carritoId);
      await loadCart();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al eliminar del carrito' 
      };
    }
  };

  const clearCart = async () => {
    try {
      await clearCarrito();
      setCart([]);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al limpiar carrito' 
      };
    }
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.productoPrecio * item.cantidad), 0);
  };

  const value = {
    cart,
    loading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    loadCart,
    getCartCount,
    getCartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
