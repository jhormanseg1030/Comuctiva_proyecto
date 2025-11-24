import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { cart, updateItem, removeItem, clearCart, getCartTotal, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = async () => {
    if (!confirm('¿Estás seguro de vaciar el carrito?')) return;
    
    const result = await clearCart();
    if (!result.success) {
      alert(result.error);
    }
  };

  if (!isAuthenticated()) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          <h4>Debes iniciar sesión</h4>
          <p>Para ver tu carrito debes iniciar sesión en tu cuenta.</p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>Cargando carrito...</p>
      </Container>
    );
  }

  if (cart.length === 0) {
    return (
      <Container className="my-5">
        <div className="empty-state">
          <h2>Tu carrito está vacío</h2>
          <p>¡Agrega algunos productos para comenzar!</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Ver Productos
          </Button>
        </div>
      </Container>
    );
  }

  const total = getCartTotal();
  const itemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <Container className="my-5">
      <h1 className="mb-4">Mi Carrito</h1>
      
      <Row>
        <Col md={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{itemCount} artículo{itemCount !== 1 ? 's' : ''}</h5>
            <Button variant="outline-danger" size="sm" onClick={handleClearCart}>
              🗑️ Vaciar Carrito
            </Button>
          </div>
          
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateItem}
              onRemove={removeItem}
            />
          ))}
        </Col>

        <Col md={4}>
          <Card className="checkout-summary">
            <Card.Header>
              <h5 className="mb-0">Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({itemCount} artículos):</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío:</span>
                <strong>Calculado en checkout</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <h5>Total estimado:</h5>
                <h5 className="text-primary">${total.toFixed(2)}</h5>
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100"
                onClick={handleCheckout}
              >
                Proceder al Pago
              </Button>
              <Button 
                variant="outline-secondary" 
                size="lg" 
                className="w-100 mt-2"
                onClick={() => navigate('/')}
              >
                Continuar Comprando
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
