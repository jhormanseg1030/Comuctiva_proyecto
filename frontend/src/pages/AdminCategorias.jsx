import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { getCategorias, createCategoria, updateCategoria, changeEstadoCategoria, deleteCategoria } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminCategorias = () => {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [processingId, setProcessingId] = useState(null);

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
      const res = await getCategorias();
      setCategorias(res.data || []);
    } catch (e) {
      console.error('Error cargando categorías', e);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setModalShow(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' }); setModalShow(true); };

  const handleSave = async () => {
    if (!isAdmin()) return alert('Acceso denegado');
    if (!form.nombre || form.nombre.trim().length === 0) return alert('El nombre es requerido');
    try {
      setProcessingId(-1);
      if (editing) {
        await updateCategoria(editing.id, { ...form });
      } else {
        await createCategoria({ ...form });
      }
      setModalShow(false);
      await load();
    } catch (err) {
      console.error('Error guardando categoría', err);
      alert(err?.response?.data?.message || 'Error guardando categoría');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActivo = async (cat) => {
    if (!isAdmin()) return alert('Acceso denegado');
    try {
      setProcessingId(cat.id);
      await changeEstadoCategoria(cat.id, !cat.activo);
      await load();
    } catch (err) {
      console.error('Error cambiando estado', err);
      alert('Error cambiando estado');
    } finally { setProcessingId(null); }
  };

  const handleDelete = async (cat) => {
    if (!isAdmin()) return alert('Acceso denegado');
    if (!window.confirm('Eliminar categoría permanentemente? (recomendado usar Desactivar)')) return;
    try {
      setProcessingId(cat.id);
      await deleteCategoria(cat.id);
      await load();
    } catch (err) {
      console.error('Error eliminando categoría', err);
      alert('Error eliminando categoría');
    } finally { setProcessingId(null); }
  };

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Administrar Categorías</h2>
        <div>
          <Button variant="success" onClick={openCreate}>Nueva Categoría</Button>
        </div>
      </div>

      {loading ? <div>Cargando categorías...</div> : (
        <Table striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nombre}</td>
                <td style={{maxWidth: 400}}>{c.descripcion}</td>
                <td>{c.activo ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(c)}>Editar</Button>
                  <Button size="sm" variant={c.activo? 'outline-warning' : 'outline-success'} className="me-2" onClick={() => handleToggleActivo(c)} disabled={processingId===c.id}>
                    {processingId===c.id ? <Spinner animation="border" size="sm"/> : (c.activo ? 'Desactivar' : 'Activar')}
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(c)} disabled={processingId===c.id}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
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
    </Container>
  );
};

export default AdminCategorias;
