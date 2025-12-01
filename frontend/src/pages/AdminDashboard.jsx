import React, { useEffect, useState } from 'react';
import { getAdminSummary } from '../services/api';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const resp = await getAdminSummary();
        setSummary(resp.data);
      } catch (e) {
        setError(e.response?.data || 'Error al obtener resumen');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) return <div>Cargando resumen...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  return (
    <div className="p-4">
      <h2>Panel de Administración</h2>
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Usuarios Totales</h5>
            <p className="display-6">{summary.usuariosTotal}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Usuarios Activos</h5>
            <p className="display-6">{summary.usuariosActivos}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Productos Totales</h5>
            <p className="display-6">{summary.productosTotal}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
