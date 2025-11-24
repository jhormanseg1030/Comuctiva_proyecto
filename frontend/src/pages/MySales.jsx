import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { getVentas } from '../services/api';

const MySales = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalVentas, setTotalVentas] = useState(0);

  useEffect(() => {
    loadMySales();
  }, []);

  const loadMySales = async () => {
    try {
      setLoading(true);
      const response = await getVentas();
      setVentas(response.data);
      
      // Calcular total de ventas
      const total = response.data.reduce((sum, venta) => sum + parseFloat(venta.subtotal || 0), 0);
      setTotalVentas(total);
      setError(null);
    } catch (err) {
      setError('Error al cargar ventas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>Cargando ventas...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Mis Ventas</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="mb-4 p-3 bg-light rounded">
        <h4>Resumen</h4>
        <p className="mb-1">Total de ventas: <strong>{ventas.length}</strong></p>
        <p className="mb-0">Ingresos totales: <strong className="text-success">${totalVentas.toFixed(2)}</strong></p>
      </div>

      {ventas.length === 0 ? (
        <Alert variant="info">
          <h4>No tienes ventas aún</h4>
          <p>Cuando tus productos sean comprados, aparecerán aquí.</p>
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Comprador</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Total</th>
              <th>Pedido</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta, index) => (
              <tr key={venta.id}>
                <td>{index + 1}</td>
                <td>{venta.pedido?.fechaPedido ? formatDate(venta.pedido.fechaPedido) : 'N/A'}</td>
                <td>{venta.producto?.nombre || 'N/A'}</td>
                <td>{venta.pedido?.compradorNombre || 'N/A'}</td>
                <td>{venta.cantidad}</td>
                <td>${parseFloat(venta.precioUnitario || 0).toFixed(2)}</td>
                <td className="fw-bold">${parseFloat(venta.subtotal || 0).toFixed(2)}</td>
                <td>
                  <Badge bg="primary">#{venta.pedido?.id || 'N/A'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default MySales;
