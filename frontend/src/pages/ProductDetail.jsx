import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Card, ListGroup, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { getProducto, getComentariosByProducto, createComentario } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';

const ProductDetail = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [calificacion, setCalificacion] = useState(5);
  const [contenido, setContenido] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadProductoData();
  }, [id]);

  const loadProductoData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        getProducto(id),
        getComentariosByProducto(id)
      ]);

      const prodRes = results[0];
      const comRes = results[1];

      if (prodRes.status === 'fulfilled') {
        const p = prodRes.value.data;
        if (p.categoriaNombre && !p.categoria) p.categoria = { nombre: p.categoriaNombre };
        if (p.subcategoriaNombre && !p.subcategoria) p.subcategoria = { nombre: p.subcategoriaNombre };
        setProducto(p);
      } else {
        throw prodRes.reason;
      }

      if (comRes.status === 'fulfilled') {
        const data = comRes.value.data;
        const comentariosArray = Array.isArray(data) ? data : (data.comentarios || []);
        setComentarios(comentariosArray);
      } else {
        setComentarios([]);
        console.warn('No se pudieron cargar comentarios para producto', id, comRes.reason);
      }

      setError(null);
    } catch (err) {
      console.error('Error cargando producto:', err.response || err);
      setError(err.response?.data?.message || err.message || 'Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    const result = await addItem(producto.id, cantidad);
    if (result.success) {
      alert('Producto agregado al carrito');
      setCantidad(1);
    } else {
      alert(result.error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para dejar un comentario');
      return;
    }

    try {
      setSubmitting(true);
      await createComentario({
        productoId: parseInt(id),
        calificacion,
        contenido
      });
      
      setCalificacion(5);
      setContenido('');
      setShowReviewForm(false);
      
      // Recargar comentarios (normalizar shape de respuesta)
      const response = await getComentariosByProducto(id);
      const data = response.data;
      const comentariosArray = Array.isArray(data) ? data : (data.comentarios || []);
      setComentarios(comentariosArray);
      
      alert('Comentario agregado exitosamente');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-warning' : 'text-muted'} style={{ fontSize: '1.5rem' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Container className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error || !producto) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error || 'Producto no encontrado'}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col md={6}>
          <img 
            src={producto.imagenUrl || 'https://via.placeholder.com/500?text=Sin+Imagen'} 
            alt={producto.nombre}
            className="img-fluid rounded"
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
          />
        </Col>
        <Col md={6}>
          <div className="mb-3">
            <Badge bg="secondary" className="me-2">{producto.categoria?.nombre}</Badge>
            {producto.subcategoria && (
              <Badge bg="info">{producto.subcategoria.nombre}</Badge>
            )}
          </div>
          <h1>{producto.nombre}</h1>
          <div className="mb-3">
            <div className="star-rating d-inline-block me-2">
              {renderStars(Math.round(producto.calificacionPromedio || 0))}
            </div>
            <span className="text-muted">
              ({producto.calificacionPromedio?.toFixed(1) || 0}) - {comentarios.length} reseñas
            </span>
          </div>
          <h2 className="text-primary mb-3">${producto.precio?.toFixed(2)}</h2>
          <p className="lead">{producto.descripcion}</p>
          
          <Card className="mb-3">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <strong>Stock disponible:</strong> {producto.stock} unidades
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {producto.stock > 0 ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Cantidad:</Form.Label>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  >
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1)))}
                    className="mx-2 text-center"
                    style={{ width: '80px' }}
                    min="1"
                    max={producto.stock}
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  >
                    +
                  </Button>
                </div>
              </Form.Group>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100"
                onClick={handleAddToCart}
              >
                🛒 Agregar al Carrito
              </Button>
            </>
          ) : (
            <Alert variant="danger">Producto agotado</Alert>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h3 className="mb-4">Reseñas de Clientes</h3>
          
          {isAuthenticated() && (
            <div className="mb-4">
              {!showReviewForm ? (
                <Button variant="outline-primary" onClick={() => setShowReviewForm(true)}>
                  ✍️ Escribir una reseña
                </Button>
              ) : (
                <Card>
                  <Card.Body>
                    <Form onSubmit={handleSubmitReview}>
                      <Form.Group className="mb-3">
                        <Form.Label>Calificación</Form.Label>
                        <div>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => setCalificacion(star)}
                              style={{ 
                                cursor: 'pointer', 
                                fontSize: '2rem',
                                color: star <= calificacion ? '#ffc107' : '#dee2e6'
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Comentario</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={contenido}
                          onChange={(e) => setContenido(e.target.value)}
                          required
                          placeholder="Cuéntanos tu experiencia con este producto..."
                        />
                      </Form.Group>
                      <div className="d-flex gap-2">
                        <Button type="submit" variant="primary" disabled={submitting}>
                          {submitting ? 'Enviando...' : 'Publicar Reseña'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}

          {comentarios.length > 0 ? (
            <ListGroup>
              {comentarios.map((comentario) => (
                <ReviewCard key={comentario.id} comentario={comentario} />
              ))}
            </ListGroup>
          ) : (
            <div className="empty-state">
              <p>Aún no hay reseñas para este producto</p>
              <p className="text-muted">¡Sé el primero en dejar una reseña!</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
