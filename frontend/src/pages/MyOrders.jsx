import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert, Row, Col, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPedidos, cancelPedido, deletePedido } from '../services/api';

const MyOrders = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
      // Mostrar mensaje detallado devuelto por el backend si existe
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage ? serverMessage : 'Error al cargar los pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarPedido = async () => {
    if (!selectedPedido) return;
    const ok = window.confirm('¿Estás seguro que quieres cancelar este pedido?');
    if (!ok) return;

    try {
      setActionLoading(true);
      setActionError(null);
      await cancelPedido(selectedPedido.id);
      setShowModal(false);
      setSelectedPedido(null);
      // Recargar lista
      await loadPedidos();
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      setActionError(serverMessage ? serverMessage : 'Error al cancelar el pedido');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEliminarPedido = async () => {
    if (!selectedPedido) return;
    const ok = window.confirm('¿Eliminar este pedido permanentemente? Esta acción no se puede deshacer.');
    if (!ok) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await deletePedido(selectedPedido.id);
      setShowModal(false);
      // Eliminar de la lista local sin refrescar
      setPedidos((prev) => prev.filter((p) => p.id !== selectedPedido.id));
      setSelectedPedido(null);
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      setDeleteError(serverMessage ? serverMessage : 'Error al eliminar el pedido');
      console.error(err);
    } finally {
      setDeleteLoading(false);
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
                Total: <span style={{color: '#1B7340'}}>${pedido.total?.toFixed(2)}</span>
              </h5>
            </div>

            <div className="mt-3 d-flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setSelectedPedido(pedido); setShowModal(true); }}
              >
                Ver Detalles
              </Button>
              
              {pedido.estadoPedido === 'CANCELADO' && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={async () => {
                    const ok = window.confirm('¿Eliminar este pedido permanentemente? Esta acción no se puede deshacer.');
                    if (!ok) return;
                    try {
                      await deletePedido(pedido.id);
                      setPedidos((prev) => prev.filter((p) => p.id !== pedido.id));
                    } catch (err) {
                      const serverMessage = err?.response?.data?.message;
                      alert(serverMessage ? serverMessage : 'Error al eliminar el pedido');
                      console.error(err);
                    }
                  }}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* Modal de detalles del pedido */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPedido ? (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1">
                    <strong>Fecha:</strong><br />{formatDate(selectedPedido.fechaPedido)}
                  </p>
                  <p className="mb-1">
                    <strong>Dirección:</strong><br />{selectedPedido.direccionEntrega}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-1">
                    <strong>Método de Pago:</strong> {selectedPedido.metodoPago}
                  </p>
                  <p className="mb-1">
                    <strong>Costo de Envío:</strong> ${selectedPedido.costoFlete?.toFixed(2)}
                  </p>
                </Col>
              </Row>

              {selectedPedido.detalles && (
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
                      {selectedPedido.detalles.map((d) => (
                        <tr key={d.id}>
                          <td>{d.producto?.nombre || d.productoNombre}</td>
                          <td>{d.cantidad}</td>
                          <td>${d.precioUnitario?.toFixed(2)}</td>
                          <td>${d.subtotal?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              <div className="text-end">
                <h5>
                  Total: <span style={{color: '#1B7340'}}>${selectedPedido.total?.toFixed(2)}</span>
                </h5>
              </div>
            </>
          ) : (
            <p>No hay detalles disponibles.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {actionError && <Alert variant="danger" className="me-auto">{actionError}</Alert>}
          {deleteError && <Alert variant="danger" className="me-auto">{deleteError}</Alert>}

          {selectedPedido && (selectedPedido.estadoPedido === 'PENDIENTE' || selectedPedido.estadoPedido === 'CONFIRMADO') && (
            <Button variant="danger" onClick={handleCancelarPedido} disabled={actionLoading}>
              {actionLoading ? 'Cancelando...' : 'Cancelar Pedido'}
            </Button>
          )}

          {selectedPedido && selectedPedido.estadoPedido === 'CANCELADO' && (
            <Button variant="outline-danger" onClick={handleEliminarPedido} disabled={deleteLoading}>
              {deleteLoading ? 'Eliminando...' : 'Eliminar Pedido'}
            </Button>
          )}

          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyOrders;
