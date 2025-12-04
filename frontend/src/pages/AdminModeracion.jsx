import React, { useEffect, useState } from 'react';
import api, { getComentariosAdmin, deleteComentarioAdmin } from '../services/api';

const AdminModeracion = () => {
  const [comentarios, setComentarios] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComentarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, size, q };
      const res = await getComentariosAdmin(params);
      const data = res.data;
      setComentarios(data.comentarios || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      setError('Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, [page, size]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComentarios();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirma eliminar este comentario?')) return;
    try {
      await deleteComentarioAdmin(id);
      // refresh
      fetchComentarios();
    } catch (e) {
      alert('Error al eliminar comentario');
    }
  };

  return (
    <div>
      <h2>Moderación de Comentarios</h2>

      <form onSubmit={handleSearch} className="mb-3 d-flex">
        <input className="form-control me-2" placeholder="Buscar texto..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary" type="submit">Buscar</button>
      </form>

      {loading && <div>Cargando...</div>}
      {error && <div className="text-danger">{error}</div>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Usuario</th>
            <th>Comentario</th>
            <th>Calificación</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {comentarios.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.productoNombre}</td>
              <td>{c.usuarioNombre} ({c.usuarioDocumento})</td>
              <td style={{maxWidth: 400, whiteSpace: 'normal'}}>{c.comentario}</td>
              <td>{c.calificacion}</td>
              <td>{new Date(c.fecha).toLocaleString()}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center">
        <div>
          Página: {page + 1} / {totalPages}
        </div>
        <div>
          <button className="btn btn-secondary me-2" disabled={page<=0} onClick={() => setPage(p => Math.max(0, p-1))}>Anterior</button>
          <button className="btn btn-secondary" disabled={page+1>=totalPages} onClick={() => setPage(p => p+1)}>Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default AdminModeracion;
