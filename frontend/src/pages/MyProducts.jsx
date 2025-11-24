import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProductosByUsuario, deleteProducto, cambiarEstadoProducto } from '../services/api';

const MyProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      const response = await getProductosByUsuario(user.numeroDocumento);
      setProductos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await deleteProducto(id);
      alert('Producto eliminado exitosamente');
      loadMyProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el producto');
    }
  };

  const toggleActivo = async (id, activo) => {
    try {
      await cambiarEstadoProducto(id, !activo);
      loadMyProducts();
    } catch (err) {
      alert('Error al actualizar el producto');
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>Cargando productos...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mis Productos</h1>
        <Button variant="primary" onClick={() => navigate('/publicar-producto')}>
          + Publicar Nuevo Producto
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {productos.length === 0 ? (
        <Alert variant="info">
          <h4>No tienes productos publicados</h4>
          <p>Comienza publicando tu primer producto para vender.</p>
          <Button variant="primary" onClick={() => navigate('/publicar-producto')}>
            Publicar Producto
          </Button>
        </Alert>
      ) : (
        <Row>
          {productos.map(producto => (
            <Col key={producto.id} md={6} lg={4} className="mb-4">
              <Card>
                <Card.Img 
                  variant="top" 
                  src={producto.imagenUrl || 'https://via.placeholder.com/300'}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0">{producto.nombre}</Card.Title>
                    <Badge bg={producto.activo ? 'success' : 'secondary'}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted small">
                    {producto.descripcion?.substring(0, 100)}...
                  </Card.Text>
                  <div className="mb-2">
                    <strong className="text-primary">${producto.precio?.toFixed(2)}</strong>
                    <span className="text-muted ms-2">Stock: {producto.stock}</span>
                  </div>
                  <div className="d-grid gap-2">
                    <Button 
                      variant={producto.activo ? 'outline-warning' : 'outline-success'}
                      size="sm"
                      onClick={() => toggleActivo(producto.id, producto.activo)}
                    >
                      {producto.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(producto.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyProducts;
