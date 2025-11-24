import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPedidos } from '../services/api';

const MyOrders = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const response = await getPedidos();
      setPedidos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      PENDIENTE: 'warning',
      CONFIRMADO: 'info',
      EN_CAMINO: 'primary',
      ENTREGADO: 'success',
      CANCELADO: 'danger'
    };
    return badges[estado] || 'secondary';
  };

  const getEstadoText = (estado) => {
    const texts = {
      PENDIENTE: 'Pendiente',
      CONFIRMADO: 'Confirmado',
      EN_CAMINO: 'En Camino',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado'
    };
    return texts[estado] || estado;
  };

  if (loading) {
    return (
      <Container className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (pedidos.length === 0) {
    return (
      <Container className="my-5">
        <div className="empty-state">
          <h2>No tienes pedidos aún</h2>
          <p>Realiza tu primera compra para ver tus pedidos aquí</p>
          <Link to="/">
            <Button variant="primary">Ver Productos</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Mis Pedidos</h1>
      
      <div className="mb-3">
        <p className="text-muted">Total de pedidos: {pedidos.length}</p>
      </div>

      {pedidos.map((pedido) => (
        <Card key={pedido.id} className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Pedido #{pedido.id}</strong>
                <br />
                <small className="text-muted">
                  {formatDate(pedido.fechaPedido)}
                </small>
              </div>
              <Badge bg={getEstadoBadge(pedido.estadoPedido)} className="order-status">
                {getEstadoText(pedido.estadoPedido)}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <p className="mb-1">
                  <strong>Dirección de Entrega:</strong><br />
                  {pedido.direccionEntrega}
                </p>
              </Col>
              <Col md={6}>
                <p className="mb-1">
                  <strong>Método de Pago:</strong> {pedido.metodoPago}
                </p>
                <p className="mb-1">
                  <strong>Costo de Envío:</strong> ${pedido.costoFlete?.toFixed(2)}
                </p>
              </Col>
            </Row>

            {pedido.detalles && pedido.detalles.length > 0 && (
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.detalles.map((detalle) => (
                      <tr key={detalle.id}>
                        <td>{detalle.producto?.nombre || 'Producto'}</td>
                        <td>{detalle.cantidad}</td>
                        <td>${detalle.precioUnitario?.toFixed(2)}</td>
                        <td>${detalle.subtotal?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            <div className="text-end">
              <h5>
                Total: <span className="text-primary">${pedido.total?.toFixed(2)}</span>
              </h5>
            </div>

            {pedido.estadoPedido === 'PENDIENTE' && (
              <div className="mt-3">
                <Link to={`/pedido/${pedido.id}`}>
                  <Button variant="primary" size="sm">Ver Detalles</Button>
                </Link>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default MyOrders;
