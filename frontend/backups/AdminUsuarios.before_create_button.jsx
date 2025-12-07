// Backup of AdminUsuarios before adding create-user modal (Option 1)
import React, { useEffect, useState } from 'react';
import { getAllUsuarios, cambiarRolUsuario, cambiarEstadoUsuario, deleteUsuario } from '../services/api';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container py-4">
      <h2>Usuarios</h2>
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
          {usuarios.map(u => (
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
  );
};

export default AdminUsuarios;
