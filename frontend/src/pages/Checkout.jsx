import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPedido } from '../services/api';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    direccionEntrega: '',
    metodoPago: 'TARJETA',
    costoFlete: 5000
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'costoFlete' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const pedidoData = {
        direccionEntrega: formData.direccionEntrega,
        metodoPago: formData.metodoPago,
        costoFlete: formData.costoFlete
      };

      const response = await createPedido(pedidoData);
      
      // Limpiar carrito local
      await clearCart();
      
      alert('¡Pedido creado exitosamente!');
      navigate(`/pedido/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el pedido');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          <h4>Carrito vacío</h4>
          <p>No hay productos en tu carrito.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Ver Productos
          </Button>
        </Alert>
      </Container>
    );
  }

  const subtotal = getCartTotal();
  const flete = formData.costoFlete;
  const total = subtotal + flete;

  return (
    <Container className="my-5">
      <h1 className="mb-4">Finalizar Compra</h1>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Información de Entrega</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.nombre || ''}
                    disabled
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Dirección de Entrega *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="direccionEntrega"
                    value={formData.direccionEntrega}
                    onChange={handleChange}
                    required
                    placeholder="Calle, número, apartamento, ciudad, código postal..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago *</Form.Label>
                  <Form.Select
                    name="metodoPago"
                    value={formData.metodoPago}
                    onChange={handleChange}
                    required
                  >
                    <option value="TARJETA">Tarjeta de Crédito/Débito</option>
                    <option value="EFECTIVO">Efectivo contra entrega</option>
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Costo de Envío *</strong></Form.Label>
                  <Form.Select
                    name="costoFlete"
                    value={formData.costoFlete}
                    onChange={handleChange}
                    required
                    className="form-select-lg"
                  >
                    <option value={5000}>Envío Estándar (3-5 días) - $5,000</option>
                    <option value={10000}>Envío Express (1-2 días) - $10,000</option>
                    <option value={0}>Recoger en tienda - Gratis</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Selecciona tu opción de envío preferida
                  </Form.Text>
                </Form.Group>

                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <div className="d-flex gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Procesando...' : 'Confirmar Pedido'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={() => navigate('/carrito')}
                  >
                    Volver al Carrito
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="checkout-summary">
            <Card.Header>
              <h5 className="mb-0">Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                {cart.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <span>
                      {item.productoNombre} x{item.cantidad}
                    </span>
                    <span>${(item.productoPrecio * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío:</span>
                <strong>${flete.toFixed(2)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <h5>Total:</h5>
                <h5 style={{ color: '#1e7e34', fontWeight: '700' }}>${total.toFixed(2)}</h5>
              </div>
              <Alert variant="info" className="mb-0">
                <small>
                  Al confirmar tu pedido, aceptas nuestros términos y condiciones.
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
