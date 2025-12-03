import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { useToast } from '../components/ToastProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProductosByUsuario, deleteProducto, cambiarEstadoProducto, updateProducto } from '../services/api';

const MyProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingIds, setLoadingIds] = useState([]); // track product ids with in-flight requests

  const hasAdminRole = () => {
    if (!user) return false;
    const roles = user.roles || user.authorities || user.authority || [];
    if (typeof roles === 'string') return roles === 'ADMIN' || roles === 'ROLE_ADMIN';
    if (Array.isArray(roles)) {
      return roles.some(r => {
        if (typeof r === 'string') return r === 'ADMIN' || r === 'ROLE_ADMIN';
        return r?.name === 'ADMIN' || r?.authority === 'ROLE_ADMIN' || r?.authority === 'ADMIN';
      });
    }
    return false;
  };
  const isAdmin = hasAdminRole();

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
      toastRef?.add && toastRef.add('Error al cargar productos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Delete option removed from UI; keep function in case it's needed for admins later
    if (!isAdmin) {
      toastRef?.add && toastRef.add('Solo administradores pueden eliminar productos.', 'warning');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await deleteProducto(id);
      toastRef?.add && toastRef.add('Producto eliminado exitosamente', 'success');
      loadMyProducts();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      toastRef?.add && toastRef.add('Error al eliminar el producto', 'danger');
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const toggleActivo = async (id, activo) => {
    // prevent duplicate requests
    if (loadingIds.includes(id)) return;

    // Optimistic update: apply immediately to UI and mark syncing
    setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, activo: !activo, syncing: true, syncError: false } : p)));
    setLoadingIds(prev => [...prev, id]);

    // Try the request, with one retry on failure. Do NOT rollback optimistic change; mark syncError if final failure.
    let attempts = 0;
    const maxAttempts = 2; // 1 initial + 1 retry
    let succeeded = false;

    while (attempts < maxAttempts && !succeeded) {
      attempts += 1;
      try {
        const response = await cambiarEstadoProducto(id, !activo);
        // If backend returned the updated product, merge it into local state
        if (response?.data && response.data.id !== undefined) {
          const updated = response.data;
          setProductos(prev => prev.map(p => (String(p.id) === String(updated.id) ? { ...updated, syncing: false, syncError: false } : p)));
        } else {
          // mark syncing false if no detailed response
          setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, syncing: false, syncError: false } : p)));
        }
        succeeded = true;
      } catch (err) {
        console.error(`Intento ${attempts} fallo al actualizar estado:`, err?.response?.status, err?.response?.data || err.message || err);
        // if we have more attempts left, wait a short time then retry
        if (attempts < maxAttempts) {
          await new Promise(res => setTimeout(res, 500));
          continue;
        }
        // final failure: backend returned error (500). It's possible the server applied the change
        // but failed while building the response. Verify actual state and sync UI.
        try {
          const fresh = await getProductosByUsuario(user.numeroDocumento);
          const serverP = fresh.data.find(p => String(p.id) === String(id));
          if (serverP) {
            // if server shows the desired activo value, refresh whole list to stay consistent
            if (serverP.activo === !activo) {
              setProductos(fresh.data);
            } else {
              // server did not apply change: mark sync error so user can retry
              setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, syncing: false, syncError: true } : p)));
            }
          } else {
            setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, syncing: false, syncError: true } : p)));
          }
        } catch (innerErr) {
          console.error('Error verificando estado en servidor tras fallo:', innerErr);
          setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, syncing: false, syncError: true } : p)));
        }
        // no alert: UI shows retry option
      }
    }

    setLoadingIds(prev => prev.filter(i => i !== id));
  };

  const retryToggle = async (id) => {
    // This retries once when user clicks 'Reintentar'
    if (loadingIds.includes(id)) return;
    // find current producto and desired activo
    const producto = productos.find(p => String(p.id) === String(id));
    if (!producto) return;
    const desiredActivo = !!producto.activo;

    // mark syncing
    setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, syncing: true, syncError: false } : p)));
    setLoadingIds(prev => [...prev, id]);

    try {
      const response = await cambiarEstadoProducto(id, desiredActivo);
      if (response?.data && response.data.id !== undefined) {
        const updated = response.data;
        setProductos(prev => prev.map(p => (String(p.id) === String(updated.id) ? { ...updated, syncing: false, syncError: false } : p)));
      } else {
        setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, syncing: false, syncError: false } : p)));
      }
    } catch (err) {
      console.error('Reintento fallo:', err?.response?.status, err?.response?.data || err.message || err);
      // Verify server state: maybe the change was applied despite the error
      try {
        const fresh = await getProductosByUsuario(user.numeroDocumento);
        const serverP = fresh.data.find(p => String(p.id) === String(id));
        if (serverP) {
          if (serverP.activo === desiredActivo) {
            setProductos(fresh.data);
          } else {
            setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, syncing: false, syncError: true } : p)));
          }
        } else {
          setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, syncing: false, syncError: true } : p)));
        }
      } catch (innerErr) {
        console.error('Error verificando estado en servidor tras reintento fallido:', innerErr);
        setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, syncing: false, syncError: true } : p)));
      }
    } finally {
      setLoadingIds(prev => prev.filter(i => i !== id));
    }
  };

  const openEditModal = (producto) => {
    setEditProduct({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion,
      stock: producto.stock,
      imagenFile: null,
      imagenUrl: producto.imagenUrl
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditProduct(null);
  };

  const handleEditChange = (field, value) => {
    // ensure precio is numeric (or empty string) to keep form controlled
    if (field === 'precio') {
      const num = value === '' ? '' : parseFloat(value);
      setEditProduct(prev => ({ ...prev, precio: num }));
    } else if (field === 'stock') {
      const num = value === '' ? '' : parseInt(value, 10);
      setEditProduct(prev => ({ ...prev, stock: num }));
    } else if (field === 'imagen') {
      // value is a File from input
      if (value) {
        const file = value;
        const previewUrl = URL.createObjectURL(file);
        setEditProduct(prev => ({ ...prev, imagenFile: file, imagenUrl: previewUrl }));
      } else {
        setEditProduct(prev => ({ ...prev, imagenFile: null }));
      }
    } else {
      setEditProduct(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    setSavingEdit(true);
    try {
      // Optimistic update: apply changes locally so user sees them immediately
      setProductos(prev => prev.map(p => (String(p.id) === String(editProduct.id) ? {
        ...p,
        nombre: editProduct.nombre ?? p.nombre,
        precio: editProduct.precio ?? p.precio,
        descripcion: editProduct.descripcion ?? p.descripcion,
        stock: editProduct.stock ?? p.stock,
        imagenUrl: editProduct.imagenFile ? editProduct.imagenUrl : p.imagenUrl,
        syncing: true,
        syncError: false
      } : p)));

      const formData = new FormData();
      if (editProduct.nombre !== undefined && editProduct.nombre !== null) formData.append('nombre', editProduct.nombre);
      if (editProduct.descripcion !== undefined && editProduct.descripcion !== null) formData.append('descripcion', editProduct.descripcion);
      if (editProduct.precio !== undefined && editProduct.precio !== null) formData.append('precio', editProduct.precio.toString());
      if (editProduct.stock !== undefined && editProduct.stock !== null) formData.append('stock', editProduct.stock.toString());
      if (editProduct.imagenFile) formData.append('imagen', editProduct.imagenFile);

      const response = await updateProducto(editProduct.id, formData);
      const updated = response.data;

      // Replace local product with server response (authoritative)
      if (updated && updated.id !== undefined) {
        setProductos(prev => prev.map(p => (String(p.id) === String(updated.id) ? { ...updated, syncing: false, syncError: false } : p)));
      } else {
        // if backend returned no body but succeeded, reload list
        await loadMyProducts();
      }
      closeEditModal();
    } catch (err) {
      console.error('Error al guardar edición:', err);
      // Intentar verificar si el cambio quedó aplicado aun cuando el servidor devolvió error
      try {
        const fresh = await getProductosByUsuario(user.numeroDocumento);
        const serverP = fresh.data.find(p => String(p.id) === String(editProduct.id));
        if (serverP && (
          (editProduct.precio == null || Number(serverP.precio) === Number(editProduct.precio)) &&
          (editProduct.descripcion == null || String(serverP.descripcion) === String(editProduct.descripcion)) &&
          (editProduct.nombre == null || String(serverP.nombre) === String(editProduct.nombre)) &&
          (editProduct.stock == null || Number(serverP.stock) === Number(editProduct.stock))
        )) {
          // cambio aplicado en servidor
          setProductos(fresh.data);
          closeEditModal();
        } else {
          // keep optimistic UI but mark error so user can retry
          setProductos(prev => prev.map(p => (String(p.id) === String(editProduct.id) ? { ...p, syncing: false, syncError: true } : p)));
            toastRef?.add && toastRef.add('Error al guardar cambios', 'danger');
        }
      } catch (innerErr) {
        console.error('Error verificando edición en servidor tras fallo:', innerErr);
        setProductos(prev => prev.map(p => (String(p.id) === String(editProduct.id) ? { ...p, syncing: false, syncError: true } : p)));
        toastRef?.add && toastRef.add('Error al guardar cambios', 'danger');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // Toast hook
  const toastRef = useToast();

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
                      type="button"
                      variant={producto.activo ? 'outline-warning' : 'outline-success'}
                      size="sm"
                      onClick={(e) => { e.preventDefault(); toggleActivo(producto.id, producto.activo); }}
                      disabled={loadingIds.includes(producto.id)}
                    >
                      {loadingIds.includes(producto.id) ? (
                        <>
                          <Spinner animation="border" size="sm" role="status" className="me-2" />
                          Procesando...
                        </>
                      ) : (
                        producto.activo ? 'Desactivar' : 'Activar'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-primary"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); openEditModal(producto); }}
                    >
                      Editar
                    </Button>
                  </div>
                  {/* Sync status / retry UI */}
                  {producto.syncing && (
                    <div className="mt-2 text-muted small">Sincronizando cambios...</div>
                  )}
                  {producto.syncError && (
                    <div className="mt-2 d-flex align-items-center">
                      <Badge bg="danger" className="me-2">Error de sincronización</Badge>
                      <Button size="sm" variant="outline-danger" onClick={() => retryToggle(producto.id)}>Reintentar</Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={closeEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={editProduct?.nombre ?? ''}
                onChange={(e) => handleEditChange('nombre', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={editProduct?.precio ?? ''}
                onChange={(e) => handleEditChange('precio', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                value={editProduct?.stock ?? ''}
                onChange={(e) => handleEditChange('stock', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editProduct?.descripcion ?? ''}
                onChange={(e) => handleEditChange('descripcion', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imagen</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => handleEditChange('imagen', e.target.files && e.target.files[0])}
              />
              {editProduct?.imagenUrl && (
                <div className="mt-2 text-center">
                  <img src={editProduct.imagenUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }} />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal} disabled={savingEdit}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEdit} disabled={savingEdit}>
            {savingEdit ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyProducts;
