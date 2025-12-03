import React from 'react';
import { Container } from 'react-bootstrap';
import logo from '../assets/images/logo.png';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="d-flex align-items-center mb-2">
              <img 
                src={logo} 
                alt="Comuctiva Logo" 
                height="50"
                className="me-2"
                style={{ borderRadius: '8px' }}
              />
              <h5 className="mb-0">COMUCTIVA</h5>
            </div>
            <p className="text-muted">Tu tienda online de confianza</p>
          </div>
          <div className="col-md-4 mb-3">
            <h6>Enlaces Rápidos</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none">Inicio</a></li>
              <li><a href="/productos" className="text-light text-decoration-none">Productos</a></li>
              <li><a href="/carrito" className="text-light text-decoration-none">Carrito</a></li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h6>Contacto</h6>
            <p className="text-muted mb-1">📧 info@comuctiva.com</p>
            <p className="text-muted mb-1">@comuctiva_camp</p>
            <p className="text-muted mb-1">📱 +57 300 123 4567</p>
            <p className="text-muted">📍 Bogotá, Colombia</p>
          </div>
        </div>
        <hr className="bg-light" />
        <div className="text-center text-muted">
          <small>© 2025 COMUCTIVA. Todos los derechos reservados.</small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
