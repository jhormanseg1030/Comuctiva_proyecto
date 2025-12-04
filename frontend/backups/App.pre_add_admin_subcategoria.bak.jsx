// Backup of frontend/src/App.jsx before adding nested admin subcategorias route

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
import AdminSubcategorias from './pages/AdminSubcategorias';
import AdminProductos from './pages/AdminProductos';
import AdminModeracion from './pages/AdminModeracion';
import AdminCategorias from './pages/AdminCategorias';

// ...rest of original file
