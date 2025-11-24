import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategorias, getSubcategoriasByCategoria, createProducto } from '../services/api';

const CreateProduct = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    fechaCosecha: '',
    categoriaId: '',
    subcategoriaId: '',
    imagen: null
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    if (formData.categoriaId) {
      loadSubcategorias(formData.categoriaId);
    } else {
      setSubcategorias([]);
      setFormData(prev => ({ ...prev, subcategoriaId: '' }));
    }
  }, [formData.categoriaId]);

  const loadCategorias = async () => {
    try {
      const response = await getCategorias();
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadSubcategorias = async (categoriaId) => {
    try {
      const response = await getSubcategoriasByCategoria(categoriaId);
      setSubcategorias(response.data);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      imagen: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('fechaCosecha', formData.fechaCosecha);
      formDataToSend.append('categoriaId', formData.categoriaId);
      formDataToSend.append('subcategoriaId', formData.subcategoriaId);
      formDataToSend.append('usuarioDocumento', user.numeroDocumento);
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      await createProducto(formDataToSend);

      setSuccess(true);
      // Limpiar formulario
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        fechaCosecha: '',
        categoriaId: '',
        subcategoriaId: '',
        imagen: null
      });
      
      // Resetear el input de archivo
      e.target.reset();

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Publicar Nuevo Producto</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  ¡Producto creado exitosamente! Redirigiendo...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Producto *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Naranjas Valencia"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                    placeholder="Describe tu producto..."
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Precio ($) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="2500"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock *</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="100"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Cosecha *</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaCosecha"
                    value={formData.fechaCosecha}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoría *</Form.Label>
                      <Form.Select
                        name="categoriaId"
                        value={formData.categoriaId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subcategoría *</Form.Label>
                      <Form.Select
                        name="subcategoriaId"
                        value={formData.subcategoriaId}
                        onChange={handleChange}
                        required
                        disabled={!formData.categoriaId}
                      >
                        <option value="">Selecciona una subcategoría</option>
                        {subcategorias.map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {sub.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Imagen del Producto</Form.Label>
                  <Form.Control
                    type="file"
                    name="imagen"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  />
                  <Form.Text className="text-muted">
                    Formatos: JPG, JPEG, PNG, GIF, WEBP. Tamaño máximo: 10MB
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={loading}
                    className="flex-grow-1"
                  >
                    {loading ? 'Publicando...' : 'Publicar Producto'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={() => navigate('/')}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateProduct;
