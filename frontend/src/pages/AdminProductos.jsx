import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { getProductos, archiveImagenProducto, restoreImagenProducto, deleteImagenProducto, cambiarEstadoProducto } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminProductos = () => {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [confirm, setConfirm] = useState({ show: false, id: null });

  const isAdmin = () => {
    if (!user) return false;
    // Support multiple shapes: user.rol (string from backend), user.role, user.roles, authorities array, etc.
    const roleString = user.rol || user.role;
    if (roleString && typeof roleString === 'string') {
      return roleString === 'ADMIN' || roleString === 'ROLE_ADMIN';
    }
    const roles = user.roles || user.authorities || user.authority || [];
    if (typeof roles === 'string') return roles === 'ADMIN' || roles === 'ROLE_ADMIN';
    if (Array.isArray(roles)) return roles.some(r => (typeof r === 'string' ? (r === 'ADMIN' || r === 'ROLE_ADMIN') : (r?.authority === 'ROLE_ADMIN' || r?.authority === 'ADMIN' || r?.name === 'ADMIN')));
    // Fallback: check the serialized user for 'ADMIN' in case backend shape differs
    try {
      const s = JSON.stringify(user || {});
      if (/"?ADMIN"?/i.test(s)) return true;
    } catch (e) {
      // ignore
    }
    return false;
  };

  useEffect(() => { loadProductos(); }, []);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const resp = await getProductos();
      setProductos(resp.data || []);
    } catch (err) {
      console.error('Error cargando productos', err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id) => {
    if (!isAdmin()) return alert('Acceso denegado');
    if (!window.confirm('Archivar la imagen (soft-delete)?')) return;
    try {
      setProcessingId(id);
      await archiveImagenProducto(id);
      await loadProductos();
    } catch (err) {
      console.error('Error archivando imagen', err);
      alert(err?.response?.data?.message || 'Error archivando imagen');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (id) => {
    if (!isAdmin()) return alert('Acceso denegado');
    try {
      setProcessingId(id);
      await restoreImagenProducto(id);
      await loadProductos();
    } catch (err) {
      console.error('Error restaurando imagen', err);
      alert(err?.response?.data?.message || 'Error restaurando imagen');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin()) return alert('Acceso denegado');
    try {
      setProcessingId(id);
      await deleteImagenProducto(id);
      await loadProductos();
    } catch (err) {
      console.error('Error eliminando imagen', err);
      alert(err?.response?.data?.message || 'Error eliminando imagen');
    } finally {
      setProcessingId(null);
      setConfirm({ show: false, id: null });
    }
  };

  if (loading) return (<Container className="my-5 text-center">Cargando productos...</Container>);

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin — Productos</h2>
      </div>

      <Row>
        {productos.map(p => (
          <Col md={6} lg={4} key={p.id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={p.imagenUrl || 'https://via.placeholder.com/300'} style={{height: '200px', objectFit: 'cover'}} />
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="mb-0">{p.nombre}</Card.Title>
                  <Badge bg={p.activo ? 'success' : 'secondary'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge>
                </div>
                <div className="mb-2 small text-muted">Vendedor: {p.usuarioNombre || p.usuarioDocumento}</div>

                <div className="mb-3">
                  <strong className="text-primary">${p.precio?.toFixed ? p.precio.toFixed(2) : p.precio}</strong>
                </div>

                <div className="d-flex gap-2">
                  <Button size="sm" variant={p.activo ? 'outline-secondary' : 'outline-success'} onClick={async () => {
                    if (!isAdmin()) return alert('Acceso denegado');
                    try {
                      setProcessingId(p.id);
                      await cambiarEstadoProducto(p.id, !p.activo);
                      await loadProductos();
                    } catch (err) {
                      console.error('Error cambiando estado producto', err);
                      alert(err?.response?.data?.message || 'Error cambiando estado');
                    } finally {
                      setProcessingId(null);
                    }
                  }} disabled={processingId===p.id}>
                    {p.activo ? 'Desactivar Producto' : 'Activar Producto'}
                  </Button>
                  
                  {p.imagenDeleted ? (
                    <Button size="sm" variant="outline-success" onClick={() => handleRestore(p.id)} disabled={processingId===p.id}>
                      {processingId===p.id ? <Spinner animation="border" size="sm" /> : 'Restaurar Imagen'}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline-warning" onClick={() => handleArchive(p.id)} disabled={processingId===p.id}>
                      {processingId===p.id ? <Spinner animation="border" size="sm"/> : 'Archivar Imagen'}
                    </Button>
                  )}

                  <Button size="sm" variant="outline-danger" onClick={() => setConfirm({ show: true, id: p.id })} disabled={processingId===p.id}>
                    Eliminar Imagen
                  </Button>
                </div>

                {p.imagenDeleted && (
                  <div className="mt-2 small text-muted">Archivada por: {p.imagenDeletedBy || '—'} el {p.imagenDeletedAt ? new Date(p.imagenDeletedAt).toLocaleString() : '—'}</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={confirm.show} onHide={() => setConfirm({ show: false, id: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar imagen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Esta acción eliminará la imagen del disco de forma permanente. ¿Deseas continuar?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirm({ show: false, id: null })}>Cancelar</Button>
          <Button variant="danger" onClick={() => handleDelete(confirm.id)} disabled={processingId===confirm.id}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminProductos;
