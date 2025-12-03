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
        comentario: contenido
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
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '50px' }}>
      <Container className="py-4" style={{ maxWidth: '1400px' }}>
        {/* Breadcrumb */}
        <div className="mb-3">
          <small className="text-muted">
            <a href="/" style={{ textDecoration: 'none', color: '#0066c0' }}>Inicio</a>
            <span className="mx-2">›</span>
            <a href="/productos" style={{ textDecoration: 'none', color: '#0066c0' }}>Productos</a>
            <span className="mx-2">›</span>
            <span>{producto.categoria?.nombre}</span>
          </small>
        </div>

        <Row className="g-4">
          {/* Columna de Imagen */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Body className="p-3 d-flex align-items-center">
                <div style={{ 
                  position: 'relative',
                  paddingBottom: '100%',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                  width: '100%'
                }}>
                  <img 
                    src={producto.imagenUrl || 'https://via.placeholder.com/500?text=Sin+Imagen'} 
                    alt={producto.nombre}
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Columna de Información */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Body className="p-3 d-flex flex-column justify-content-center">
                {/* Categorías */}
                <div className="mb-2">
                  <Badge 
                    bg="light" 
                    text="dark" 
                    className="me-2 px-3 py-2" 
                    style={{ fontSize: '0.85rem', fontWeight: '500' }}
                  >
                    {producto.categoria?.nombre}
                  </Badge>
                  {producto.subcategoria && (
                    <Badge 
                      bg="light" 
                      text="dark" 
                      className="px-3 py-2" 
                      style={{ fontSize: '0.85rem', fontWeight: '500' }}
                    >
                      {producto.subcategoria.nombre}
                    </Badge>
                  )}
                </div>

                {/* Título */}
                <h1 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '400', 
                  lineHeight: '1.3',
                  marginBottom: '10px',
                  color: '#0f1111'
                }}>
                  {producto.nombre}
                </h1>

                {/* Rating */}
                <div className="mb-2 d-flex align-items-center">
                  <div className="star-rating me-2">
                    {renderStars(Math.round(producto.calificacionPromedio || 0))}
                  </div>
                  <span style={{ color: '#0066c0', fontSize: '0.9rem', fontWeight: '500' }}>
                    {producto.calificacionPromedio?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-muted ms-2" style={{ fontSize: '0.9rem' }}>
                    ({comentarios.length} {comentarios.length === 1 ? 'reseña' : 'reseñas'})
                  </span>
                </div>

                <hr style={{ margin: '12px 0' }} />

                {/* Precio */}
                <div className="mb-2">
                  <div className="d-flex align-items-baseline">
                    <span style={{ fontSize: '0.85rem', color: '#565959', marginRight: '8px' }}>
                      Precio:
                    </span>
                    <span style={{ 
                      fontSize: '2rem', 
                      fontWeight: '700', 
                      color: '#000',
                      lineHeight: '1'
                    }}>
                      ${producto.precio?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <hr style={{ margin: '12px 0' }} />

                {/* Descripción */}
                <div className="mb-3">
                  <h6 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>
                    Acerca de este producto
                  </h6>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    lineHeight: '1.6',
                    color: '#0f1111',
                    marginBottom: 0
                  }}>
                    {producto.descripcion}
                  </p>
                </div>

                <hr style={{ margin: '12px 0' }} />

                {/* Stock */}
                <div className="mb-2">
                  {producto.stock > 0 ? (
                    <div style={{ 
                      color: producto.stock < 10 ? '#B12704' : '#007600',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                      {producto.stock < 10 
                        ? `Solo quedan ${producto.stock} unidades - Pídelo pronto` 
                        : `Disponible (${producto.stock} unidades)`
                      }
                    </div>
                  ) : (
                    <div style={{ color: '#B12704', fontSize: '1rem', fontWeight: '700' }}>
                      Agotado
                    </div>
                  )}
                </div>

                {/* Selector de cantidad y botón */}
                {producto.stock > 0 && (
                  <div className="mt-4">
                    <Row className="g-3">
                      <Col md={12}>
                        <div className="d-flex gap-3 align-items-end">
                          <div style={{ flex: '0 0 auto' }}>
                            <Form.Label style={{ fontSize: '0.9rem', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                              Cantidad:
                            </Form.Label>
                            <div className="d-flex align-items-center" style={{ 
                              border: '1px solid #D5D9D9',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              backgroundColor: '#fff'
                            }}>
                              <Button 
                                variant="light"
                                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                style={{ 
                                  border: 'none',
                                  borderRadius: 0,
                                  padding: '10px 15px',
                                  fontSize: '1.2rem',
                                  fontWeight: '300',
                                  color: '#fff',
                                  backgroundColor: '#28a745'
                                }}
                              >
                                −
                              </Button>
                              <Form.Control
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1)))}
                                className="text-center border-0"
                                style={{ 
                                  width: '70px',
                                  fontSize: '1rem',
                                  fontWeight: '500',
                                  boxShadow: 'none'
                                }}
                                min="1"
                                max={producto.stock}
                              />
                              <Button 
                                variant="light"
                                onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                                style={{ 
                                  border: 'none',
                                  borderRadius: 0,
                                  padding: '10px 15px',
                                  fontSize: '1.2rem',
                                  fontWeight: '300',
                                  color: '#fff',
                                  backgroundColor: '#28a745'
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div style={{ flex: '1 1 auto' }}>
                            <Button 
                              size="lg" 
                              className="w-100"
                              onClick={handleAddToCart}
                              style={{
                                backgroundColor: '#FFD814',
                                border: '1px solid #FCD200',
                                borderRadius: '8px',
                                color: '#0F1111',
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                padding: '10px',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#F7CA00'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#FFD814'}
                            >
                              🛒 Agregar al Carrito
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sección de Reseñas */}
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Body className="p-4">
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  marginBottom: '25px',
                  color: '#0f1111'
                }}>
                  Reseñas de Clientes
                </h3>
                
                {isAuthenticated() && (
                  <div className="mb-4">
                    {!showReviewForm ? (
                      <Button 
                        onClick={() => setShowReviewForm(true)}
                        style={{
                          backgroundColor: '#fff',
                          border: '1px solid #D5D9D9',
                          borderRadius: '8px',
                          color: '#0F1111',
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          padding: '10px 20px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#F7FAFA'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                      >
                        ✍️ Escribir una reseña
                      </Button>
                    ) : (
                      <div style={{ 
                        backgroundColor: '#F7FAFA',
                        padding: '25px',
                        borderRadius: '8px',
                        border: '1px solid #D5D9D9'
                      }}>
                        <Form onSubmit={handleSubmitReview}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: '0.95rem', fontWeight: '700' }}>
                              Calificación
                            </Form.Label>
                            <div>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  onClick={() => setCalificacion(star)}
                                  style={{ 
                                    cursor: 'pointer', 
                                    fontSize: '2rem',
                                    color: star <= calificacion ? '#FFA41C' : '#dee2e6',
                                    marginRight: '4px',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: '0.95rem', fontWeight: '700' }}>
                              Comentario
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              value={contenido}
                              onChange={(e) => setContenido(e.target.value)}
                              required
                              placeholder="Cuéntanos tu experiencia con este producto..."
                              style={{
                                borderRadius: '8px',
                                border: '1px solid #D5D9D9',
                                fontSize: '0.95rem'
                              }}
                            />
                          </Form.Group>
                          <div className="d-flex gap-2">
                            <Button 
                              type="submit" 
                              disabled={submitting}
                              style={{
                                backgroundColor: '#FFD814',
                                border: '1px solid #FCD200',
                                borderRadius: '8px',
                                color: '#0F1111',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                padding: '8px 20px'
                              }}
                            >
                              {submitting ? 'Enviando...' : 'Publicar Reseña'}
                            </Button>
                            <Button 
                              type="button" 
                              onClick={() => setShowReviewForm(false)}
                              style={{
                                backgroundColor: '#fff',
                                border: '1px solid #D5D9D9',
                                borderRadius: '8px',
                                color: '#0F1111',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                padding: '8px 20px'
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </Form>
                      </div>
                    )}
                  </div>
                )}

                {comentarios.length > 0 ? (
                  <div>
                    {comentarios.map((comentario, index) => (
                      <div key={comentario.id}>
                        <ReviewCard comentario={comentario} />
                        {index < comentarios.length - 1 && <hr style={{ margin: '20px 0' }} />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    backgroundColor: '#F7FAFA',
                    borderRadius: '8px'
                  }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#0f1111' }}>
                      Aún no hay reseñas para este producto
                    </p>
                    <p className="text-muted" style={{ marginBottom: 0 }}>
                      ¡Sé el primero en dejar una reseña!
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProductDetail;
