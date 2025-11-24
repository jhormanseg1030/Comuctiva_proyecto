import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🛒 EComerce
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/productos">Productos</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated() && (
              <Nav.Link as={Link} to="/carrito" className="btn-cart position-relative">
                🛒 Carrito
                {getCartCount() > 0 && (
                  <Badge bg="danger" className="cart-badge">
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
