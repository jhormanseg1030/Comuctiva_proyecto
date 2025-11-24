import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ producto }) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    setLoading(true);
    const result = await addItem(producto.id, 1);
    setLoading(false);

    if (result.success) {
      alert('Producto agregado al carrito');
    } else {
      alert(result.error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-warning' : 'text-muted'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <Card className="product-card h-100">
      <Link to={`/producto/${producto.id}`} className="text-decoration-none">
        <Card.Img 
          variant="top" 
          src={producto.imagenUrl || 'https://via.placeholder.com/300x250?text=Sin+Imagen'} 
          className="product-image"
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          <Badge bg="secondary" className="me-2">{producto.categoria?.nombre}</Badge>
          {producto.subcategoria && (
            <Badge bg="info">{producto.subcategoria.nombre}</Badge>
          )}
        </div>
        <Card.Title as={Link} to={`/producto/${producto.id}`} className="text-decoration-none text-dark">
          {producto.nombre}
        </Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {producto.descripcion?.substring(0, 100)}...
        </Card.Text>
        <div className="mb-2">
          <div className="star-rating">
            {renderStars(Math.round(producto.calificacionPromedio || 0))}
          </div>
          <small className="text-muted">
            ({producto.calificacionPromedio?.toFixed(1) || 0})
          </small>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary">
            ${producto.precio?.toFixed(2)}
          </h5>
          <Badge bg={producto.stock > 0 ? 'success' : 'danger'}>
            {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
          </Badge>
        </div>
        <Button 
          variant="primary" 
          className="mt-3 w-100"
          onClick={handleAddToCart}
          disabled={loading || producto.stock === 0}
        >
          {loading ? 'Agregando...' : '🛒 Agregar al Carrito'}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
