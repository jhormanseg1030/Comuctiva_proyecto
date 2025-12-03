import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Styles
import './styles/custom.css';

// Components
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import QuienesSomos from './pages/QuienesSomos';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyAccount from './pages/MyAccount';
import MyOrders from './pages/MyOrders';
import CreateProduct from './pages/CreateProduct';
import MyProducts from './pages/MyProducts';
import MySales from './pages/MySales';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminPedidos from './pages/AdminPedidos';
import AdminLayout from './pages/AdminLayout';
import AdminAuditoria from './pages/AdminAuditoria';
import AdminProductos from './pages/AdminProductos';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <NavigationBar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/productos" element={<Home />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mi-cuenta" 
              element={
                <ProtectedRoute>
                  <MyAccount />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mis-pedidos" 
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/publicar-producto" 
              element={
                <ProtectedRoute>
                  <CreateProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mis-productos" 
              element={
                <ProtectedRoute>
                  <MyProducts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mis-ventas" 
              element={
                <ProtectedRoute>
                  <MySales />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reportes" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}>
              <Route index element={<AdminDashboard/>} />
              <Route path="usuarios" element={<AdminUsuarios/>} />
              <Route path="productos" element={<AdminProductos/>} />
              <Route path="pedidos" element={<AdminPedidos/>} />
              <Route path="auditoria" element={<AdminAuditoria/>} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
