import React, { useEffect, useState } from 'react';
import { getAllPedidos, actualizarEstadoPedido } from '../services/api';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      const res = await getAllPedidos();
      setPedidos(res.data);
    } catch (err) {
      console.error('Error loading pedidos:', err);
      // Mostrar mensaje más descriptivo si el servidor lo envía
      const serverMessage = err?.response?.data?.message || err?.response?.data || err.message || 'Error desconocido';
      alert(`Error cargando pedidos: ${JSON.stringify(serverMessage)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  // Mapa para traducir etiquetas/alias de UI a los enums esperados por el backend
  const estadoMap = {
    ENVIADO: 'EN_CAMINO',
    EN_CAMINO: 'EN_CAMINO',
    ENTREGADO: 'ENTREGADO',
    CANCELADO: 'CANCELADO',
    PENDIENTE: 'PENDIENTE',
    CONFIRMADO: 'CONFIRMADO'
  };

  const handleCambiarEstado = async (id, estado) => {
    const estadoBackend = estadoMap[estado] || estado;
    if (!window.confirm(`Cambiar estado pedido ${id} a ${estadoBackend}?`)) return;
    try {
      await actualizarEstadoPedido(id, estadoBackend);
      fetchPedidos();
    } catch (err) {
      console.error('Error actualizando estado pedido:', err);
      // Mostrar mensaje detallado del servidor si está disponible
      const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message || 'Error al actualizar estado';
      alert(serverMsg);
    }
  };

  if (loading) return <div>Cargando pedidos...</div>;

  return (
    <div className="container py-4">
      <h2>Pedidos</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Comprador</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.comprador?.numeroDocumento}</td>
              <td>{p.total}</td>
              <td>{p.estado}</td>
              <td>
                <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleCambiarEstado(p.id, 'EN_CAMINO')}>Marcar Enviado</button>
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleCambiarEstado(p.id, 'ENTREGADO')}>Marcar Entregado</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleCambiarEstado(p.id, 'CANCELADO')}>Cancelar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPedidos;
