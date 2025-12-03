import React, { useEffect, useState } from 'react';
import { getAllUsuarios, cambiarEstadoUsuario, deleteUsuario } from '../services/api';

const AdminPromociones = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = async () => {
    try {
      const res = await getAllUsuarios();
      const inactivos = (res.data || []).filter(u => u.activo === false || u.activo === null);
      setUsuarios(inactivos);
    } catch (err) {
      console.error(err);
      window.alert('Error cargando usuarios archivados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleRestaurar = async (numeroDocumento) => {
    if (!window.confirm(`¿Restaurar el usuario ${numeroDocumento}?`)) return;
    try {
      await cambiarEstadoUsuario(numeroDocumento, true);
      await fetchUsuarios();
      window.alert('Usuario restaurado correctamente');
    } catch (err) {
      console.error(err);
      window.alert('Error al restaurar usuario');
    }
  };

  const handleBorrarPermanente = async (numeroDocumento) => {
    const ok = window.confirm('Eliminar permanentemente este usuario es irreversible. ¿Continuar?');
    if (!ok) return;
    try {
      await deleteUsuario(numeroDocumento);
      await fetchUsuarios();
      window.alert('Usuario eliminado permanentemente');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data || err.message || 'Error al eliminar usuario';
      window.alert('Error al eliminar usuario: ' + JSON.stringify(msg));
    }
  };

  if (loading) return <div className="p-4">Cargando papelera de usuarios...</div>;

  return (
    <div className="container py-4">
      <h2>Papelera de Usuarios (Archivados)</h2>
      {usuarios.length === 0 ? (
        <p>No hay usuarios archivados.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Fecha registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.numeroDocumento}>
                <td>{u.numeroDocumento}</td>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.correo}</td>
                <td>{u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleString() : '-'}</td>
                <td>
                  <button className="btn btn-sm btn-success me-2" onClick={() => handleRestaurar(u.numeroDocumento)}>Restaurar</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleBorrarPermanente(u.numeroDocumento)}>Borrar permanentemente</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPromociones;
