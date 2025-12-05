import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { getSubcategorias, createSubcategoria, updateSubcategoria, changeEstadoSubcategoria, deleteSubcategoria, getCategorias } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminSubcategorias = () => {
  const { user } = useAuth();
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', categoriaId: '' });
  const [processingId, setProcessingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const pushToast = (message, variant = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const isAdmin = () => {
    if (!user) return false;
    const roleString = user.rol || user.role;
    if (roleString && typeof roleString === 'string') {
      return roleString === 'ADMIN' || roleString === 'ROLE_ADMIN';
    }
    const roles = user.roles || user.authorities || user.authority || [];
    if (typeof roles === 'string') return roles === 'ADMIN' || roles === 'ROLE_ADMIN';
    if (Array.isArray(roles)) return roles.some(r => (typeof r === 'string' ? (r === 'ADMIN' || r === 'ROLE_ADMIN') : (r?.authority === 'ROLE_ADMIN' || r?.authority === 'ADMIN' || r?.name === 'ADMIN')));
    try { const s = JSON.stringify(user || {}); if ("ADMIN".test) return s.includes('ADMIN'); } catch(e) {}
    return false;
  };

  const load = async () => {
    setLoading(true);
    try {
      const resp = await getSubcategorias();
      setSubcategorias(resp.data || []);
      const cats = await getCategorias();
      setCategorias(cats.data || []);
    } catch (e) {
      console.error('Error cargando subcategorías', e);
      setSubcategorias([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ nombre: '', descripcion: '', categoriaId: '' }); setModalShow(true); };
  const openEdit = (s) => { setEditing(s); setForm({ nombre: s.nombre, descripcion: s.descripcion || '', categoriaId: s.categoriaId != null ? String(s.categoriaId) : (s.categoria ? String(s.categoria.id) : '') }); setModalShow(true); };

  const handleSave = async () => {
    if (!isAdmin()) return pushToast('Acceso denegado', 'danger');
    if (!form.nombre || form.nombre.trim().length === 0) return pushToast('El nombre es requerido', 'warning');
    try {
      setProcessingId(-1);
      const payload = { nombre: form.nombre, descripcion: form.descripcion, categoriaId: form.categoriaId ? Number(form.categoriaId) : null };
      if (editing) {
        await updateSubcategoria(editing.id, payload);
        pushToast('Subcategoría actualizada', 'success');
      } else {
        await createSubcategoria(payload);
        pushToast('Subcategoría creada', 'success');
      }
      setModalShow(false);
      await load();
    } catch (err) {
      console.error('Error guardando subcategoría', err);
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Error guardando subcategoría';
      pushToast(String(msg), 'danger');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActivo = async (s) => {
    if (!isAdmin()) return pushToast('Acceso denegado', 'danger');
    try {
      setProcessingId(s.id);
      const resp = await changeEstadoSubcategoria(s.id, !s.activo);
      // update local list optimistically from returned DTO if present
      if (resp && resp.data) {
        setSubcategorias(prev => prev.map(x => x.id === s.id ? resp.data : x));
      } else {
        await load();
      }
      pushToast(s.activo ? 'Subcategoría desactivada' : 'Subcategoría activada', 'success');
    } catch (err) {
      console.error('Error cambiando estado', err);
      const msg = err?.response?.data?.message || err?.message || 'Error cambiando estado';
      pushToast(String(msg), 'danger');
    } finally { setProcessingId(null); }
  };

  const handleDelete = async (s) => {
    if (!isAdmin()) return pushToast('Acceso denegado', 'danger');
    if (!window.confirm('Eliminar subcategoría permanentemente? (recomendado usar Desactivar)')) return;
    try {
      setProcessingId(s.id);
      await deleteSubcategoria(s.id);
      pushToast('Subcategoría eliminada', 'success');
      await load();
    } catch (err) {
      console.error('Error eliminando subcategoría', err);
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Error eliminando subcategoría';
      pushToast(String(msg), 'danger');
    } finally { setProcessingId(null); }
  };

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Administrar Subcategorías</h2>
        <div>
          <Button variant="success" onClick={openCreate}>Nueva Subcategoría</Button>
        </div>
      </div>

      {loading ? <div>Cargando subcategorías...</div> : (
        <Table striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subcategorias.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.nombre}</td>
                <td>{s.categoriaNombre || (s.categoria ? s.categoria.nombre : '')}</td>
                <td style={{maxWidth: 400}}>{s.descripcion}</td>
                <td>{s.activo ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(s)}>Editar</Button>
                  <Button size="sm" variant={s.activo? 'outline-warning' : 'outline-success'} className="me-2" onClick={() => handleToggleActivo(s)} disabled={processingId===s.id}>
                    {processingId===s.id ? <Spinner animation="border" size="sm"/> : (s.activo ? 'Desactivar' : 'Activar')}
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(s)} disabled={processingId===s.id}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Editar Subcategoría' : 'Nueva Subcategoría'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select value={form.categoriaId} onChange={(e) => setForm({...form, categoriaId: e.target.value})}>
                <option value="">-- Seleccione --</option>
                {categorias.map(c => (<option value={c.id} key={c.id}>{c.nombre}</option>))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={processingId===-1}>{processingId===-1 ? <Spinner animation="border" size="sm"/> : 'Guardar'}</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        {toasts.map(t => (
          <Toast key={t.id} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
            <Toast.Header>
              <strong className="me-auto">Notificación</strong>
            </Toast.Header>
            <Toast.Body className={t.variant === 'danger' ? 'text-danger' : (t.variant === 'warning' ? 'text-warning' : '')}>{t.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </Container>
  );
};

export default AdminSubcategorias;
