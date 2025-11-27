import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import { getProductos, getCategorias, getProductosByCategoria, buscarProductos } from '../services/api';

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros avanzados
  const [minPrecio, setMinPrecio] = useState('');
  const [maxPrecio, setMaxPrecio] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('reciente');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 9;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productosRes, categoriasRes] = await Promise.all([
        getProductos(),
        getCategorias()
      ]);
      // Mostrar sólo productos activos en la página de inicio
      setProductos(productosRes.data.filter(p => p.activo));
      setCategorias(categoriasRes.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaChange = async (categoriaId) => {
    setSelectedCategoria(categoriaId);
    setSearchTerm('');
    
    try {
      setLoading(true);
      if (categoriaId === null) {
        const response = await getProductos();
        setProductos(response.data.filter(p => p.activo));
      } else {
        const response = await getProductosByCategoria(categoriaId);
        setProductos(response.data.filter(p => p.activo));
      }
      setError(null);
    } catch (err) {
      setError('Error al filtrar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedCategoria(null);
    setPaginaActual(1);

    if (value.trim() === '') {
      loadInitialData();
      return;
    }

    if (value.length < 2) return;

    try {
      setLoading(true);
      const response = await buscarProductos(value);
      // Buscar debe devolver sólo resultados activos en la vista pública
      setProductos(response.data.filter(p => p.activo));
      setError(null);
    } catch (err) {
      setError('Error al buscar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por precio
  const productosFiltrados = productos.filter(producto => {
    const precio = producto.precio;
    const min = minPrecio ? parseFloat(minPrecio) : 0;
    const max = maxPrecio ? parseFloat(maxPrecio) : Infinity;
    return precio >= min && precio <= max;
  });

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (ordenamiento) {
      case 'precio-asc':
        return a.precio - b.precio;
      case 'precio-desc':
        return b.precio - a.precio;
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      case 'reciente':
      default:
        return new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion);
    }
  });

  // Paginación
  const indexUltimo = paginaActual * productosPorPagina;
  const indexPrimero = indexUltimo - productosPorPagina;
  const productosActuales = productosOrdenados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(productosOrdenados.length / productosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="hero-section">
        <Container>
          <h1 className="display-4 fw-bold">Bienvenido a Comuctiva</h1>
          <p className="lead">Encuentra los mejores productos al mejor precio</p>
        </Container>
      </div>

      <Container className="my-4">
        <Row className="mb-4">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="🔍 Buscar productos..."
              value={searchTerm}
              onChange={handleSearch}
              size="lg"
            />
          </Col>
          <Col md={4}>
            <Form.Select 
              size="lg" 
              value={ordenamiento} 
              onChange={(e) => {
                setOrdenamiento(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="reciente">Más recientes</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
              <option value="nombre">Nombre A-Z</option>
            </Form.Select>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Row>
          <Col md={3}>
            <CategoryFilter
              categorias={categorias}
              selectedCategoria={selectedCategoria}
              onSelectCategoria={handleCategoriaChange}
            />
            
            {/* Filtro de Precio */}
            <div className="mt-4">
              <h5>Filtrar por Precio</h5>
              <Form.Group className="mb-2">
                <Form.Label>Precio Mínimo</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="$0"
                  value={minPrecio}
                  onChange={(e) => {
                    setMinPrecio(e.target.value);
                    setPaginaActual(1);
                  }}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Precio Máximo</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Sin límite"
                  value={maxPrecio}
                  onChange={(e) => {
                    setMaxPrecio(e.target.value);
                    setPaginaActual(1);
                  }}
                />
              </Form.Group>
              {(minPrecio || maxPrecio) && (
                <button 
                  className="btn btn-sm btn-outline-secondary mt-2 w-100"
                  onClick={() => {
                    setMinPrecio('');
                    setMaxPrecio('');
                    setPaginaActual(1);
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </Col>
          <Col md={9}>
            {loading ? (
              <div className="loading-spinner">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : productosOrdenados.length > 0 ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>{productosOrdenados.length} productos encontrados</h5>
                  {totalPaginas > 1 && (
                    <span className="text-muted">
                      Página {paginaActual} de {totalPaginas}
                    </span>
                  )}
                </div>
                <Row>
                  {productosActuales.map((producto) => (
                    <Col key={producto.id} md={4} className="mb-4">
                      <ProductCard producto={producto} />
                    </Col>
                  ))}
                </Row>
                
                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => cambiarPagina(paginaActual - 1)}
                            disabled={paginaActual === 1}
                          >
                            Anterior
                          </button>
                        </li>
                        {[...Array(totalPaginas)].map((_, index) => (
                          <li 
                            key={index + 1} 
                            className={`page-item ${paginaActual === index + 1 ? 'active' : ''}`}
                          >
                            <button 
                              className="page-link" 
                              onClick={() => cambiarPagina(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => cambiarPagina(paginaActual + 1)}
                            disabled={paginaActual === totalPaginas}
                          >
                            Siguiente
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <h3>No se encontraron productos</h3>
                <p>Intenta con otra búsqueda o categoría</p>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
