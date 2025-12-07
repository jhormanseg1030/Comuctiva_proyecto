// Backup before adding edit modal - Dec 6, 2025
import React, { useEffect, useState } from 'react';
import { 
  getAllUsuarios, 
  cambiarRolUsuario, 
  cambiarEstadoUsuario, 
  deleteUsuario,
  register as registerApi
} from '../services/api';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [filtroDocumento, setFiltroDocumento] = useState('');
  const [formData, setFormData] = useState({
    numeroDocumento: '',
    tipoDocumento: 'CEDULA',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: '',
    rol: 'USER'
  });

  const fetchUsuarios = async () => {
    try {
      const res = await getAllUsuarios();
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
      alert('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      numeroDocumento: '',
      tipoDocumento: 'CEDULA',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      password: '',
      confirmPassword: '',
      rol: 'USER'
    });
    setCreateError(null);
  };

  const validateCreatePayload = () => {
    const required = ['numeroDocumento', 'tipoDocumento', 'nombre', 'apellido', 'email', 'telefono', 'direccion', 'password', 'confirmPassword'];
    for (const key of required) {
      if (!formData[key] || String(formData[key]).trim() === '') {
        return 'Por favor completa todos los campos obligatorios';
      }
    }
    if (formData.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden';
    return null;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);
    const validationError = validateCreatePayload();
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreating(true);
    try {
      const { confirmPassword, email, ...rest } = formData;
      const payload = { ...rest, correo: email };
      await registerApi(payload);
      setShowCreate(false);
      resetForm();
      fetchUsuarios();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear usuario';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleCambiarRol = async (numeroDocumento, nuevoRol) => {
    if (!window.confirm(`Cambiar rol de ${numeroDocumento} a ${nuevoRol}?`)) return;
    try {
      await cambiarRolUsuario(numeroDocumento, nuevoRol);
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar rol');
    }
  };

  const handleCambiarEstado = async (numeroDocumento, activo) => {
    if (!window.confirm(`${activo ? 'Activar' : 'Desactivar'} usuario ${numeroDocumento}?`)) return;
    try {
      await cambiarEstadoUsuario(numeroDocumento, activo);
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar estado');
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;

  const usuariosFiltrados = usuarios.filter(u => {
    if (!filtroDocumento.trim()) return true;
    return (u.numeroDocumento || '').toLowerCase().includes(filtroDocumento.trim().toLowerCase());
  });

  return (
    <>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="mb-0">Usuarios</h2>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreate(true); }}>
            Crear usuario
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label">Filtrar por documento</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: 12345"
            value={filtroDocumento}
            onChange={(e) => setFiltroDocumento(e.target.value)}
          />
        </div>

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(u => (
              <tr key={u.numeroDocumento}>
                <td>{u.numeroDocumento}</td>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>{u.activo ? 'Sí' : 'No'}</td>
                <td>
                  {u.rol !== 'ADMIN' && (
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleCambiarRol(u.numeroDocumento, 'ADMIN')}>Hacer Admin</button>
                  )}
                  {u.rol === 'ADMIN' && (
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleCambiarRol(u.numeroDocumento, 'USER')}>Quitar Admin</button>
                  )}
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleCambiarEstado(u.numeroDocumento, !u.activo)}>{u.activo ? 'Desactivar' : 'Activar'}</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                    if (!window.confirm(`Eliminar usuario ${u.numeroDocumento}? Esta acción no se puede deshacer.`)) return;
                    try {
                      await deleteUsuario(u.numeroDocumento);
                      fetchUsuarios();
                    } catch (err) {
                      console.error(err);
                      alert('Error al eliminar usuario');
                    }
                  }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear nuevo usuario</h5>
                <button type="button" className="btn-close" onClick={() => { setShowCreate(false); setCreateError(null); }}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  {createError && <div className="alert alert-danger">{createError}</div>}

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Tipo de Documento *</label>
                      <select className="form-select" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleFormChange} required>
                        <option value="CEDULA">Cédula</option>
                        <option value="PASAPORTE">Pasaporte</option>
                        <option value="CEDULA_EXTRANJERIA">Cédula de Extranjería</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Número de Documento *</label>
                      <input className="form-control" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleFormChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Rol *</label>
                      <select className="form-select" name="rol" value={formData.rol} onChange={handleFormChange}>
                        <option value="USER">Usuario</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Nombre *</label>
                      <input className="form-control" name="nombre" value={formData.nombre} onChange={handleFormChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Apellido *</label>
                      <input className="form-control" name="apellido" value={formData.apellido} onChange={handleFormChange} required />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input type="email" className="form-control" name="email" value={formData.email} onChange={handleFormChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Teléfono *</label>
                      <input className="form-control" name="telefono" value={formData.telefono} onChange={handleFormChange} required />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Dirección *</label>
                      <input className="form-control" name="direccion" value={formData.direccion} onChange={handleFormChange} required />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Contraseña *</label>
                      <input type="password" className="form-control" name="password" value={formData.password} onChange={handleFormChange} required minLength={6} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Confirmar Contraseña *</label>
                      <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleFormChange} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowCreate(false); setCreateError(null); }} disabled={creating}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Creando...' : 'Crear usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsuarios;
