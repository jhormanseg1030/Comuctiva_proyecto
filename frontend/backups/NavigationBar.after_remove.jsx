// Backup of current NavigationBar before re-adding Usuarios and Pedidos links in dropdown
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/images/logo.jpeg';

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar 
      expand="lg" 
      sticky="top"
      style={{ backgroundColor: '#1a1a1a' }}
      variant="dark"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img 
            src={logo} 
            alt="Comuctiva Logo" 
            height="40"
            className="d-inline-block align-top me-2"
            style={{ borderRadius: '5px' }}
          />
          Comuctiva
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/quienes-somos">Quiénes Somos</Nav.Link>
            <Nav.Link as={Link} to="/productos">Productos</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated() && (
              <Nav.Link as={Link} to="/carrito" className="position-relative">
                🛒 Carrito
                {getCartCount() > 0 && (
                  <Badge 
                    style={{ 
                      backgroundColor: '#18692bff',
                      position: 'absolute',
                      top: '0',
                      right: '-10px'
                    }}
                  >
                    {getCartCount()}
                  </Badge>
                )}
              </Nav.Link>
            )}
            {isAuthenticated() ? (
              <NavDropdown title={`👤 ${user.nombre}`} id="user-dropdown">
                <NavDropdown.Item as={Link} to="/mi-cuenta">👤 Mi Cuenta</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/mis-pedidos">📋 Mis Pedidos</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/publicar-producto">📦 Publicar Producto</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/mis-productos">🏪 Mis Productos</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/mis-ventas">💰 Mis Ventas</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Cerrar Sesión</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
