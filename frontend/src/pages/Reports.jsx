import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  getProductosByUsuario, 
  getPedidos, 
  getVentas,
  getProductos 
} from '../services/api';
import { exportConsolidatedToExcel, exportSingleReportToExcel } from '../utils/excelExport';
import { exportConsolidatedToPDF, exportSingleReportToPDF } from '../utils/pdfExport';
import logo from '../assets/images/logo.png';
import '../styles/Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('productos');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadReportData();
  }, [reportType]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      
      switch (reportType) {
        case 'productos':
          const productosRes = await getProductosByUsuario(user.numeroDocumento);
          data = productosRes.data.map(p => ({
            nombre: p.nombre,
            valor: p.precio,
            cantidad: p.stock,
            categoria: p.categoriaNombre || 'Sin categoría',
            descripcion: p.descripcion
          }));
          break;
          
        case 'pedidos':
          const pedidosRes = await getPedidos();
          data = pedidosRes.data.map(p => ({
            fecha: new Date(p.fechaPedido).toLocaleDateString('es-ES'),
            valor: p.total,
            estado: p.estado,
            direccion: p.direccionEnvio,
            metodoPago: p.metodoPago
          }));
          break;
          
        case 'ventas':
          const ventasRes = await getVentas();
          data = ventasRes.data.map(v => ({
            producto: v.producto?.nombre || v.productoNombre || 'N/A',
            cantidad: v.cantidad,
            valor: v.precioUnitario,
            total: v.subtotal || (v.precioUnitario * v.cantidad),
            // Fecha y estado vienen en el objeto 'pedido' del DTO
            fecha: v.pedido?.fechaPedido ? new Date(v.pedido.fechaPedido).toLocaleDateString('es-ES') : 'N/A',
            estado: v.pedido?.estado || 'N/A'
          }));
          break;
          
        case 'compras':
          const comprasRes = await getPedidos();
          const comprasDataList = [];
          comprasRes.data.forEach(pedido => {
            if (pedido.detalles && Array.isArray(pedido.detalles)) {
              pedido.detalles.forEach(detalle => {
                comprasDataList.push({
                  producto: detalle.productoNombre || detalle.producto?.nombre || 'N/A',
                  cantidad: detalle.cantidad,
                  valor: detalle.precioUnitario,
                  total: detalle.subtotal || (detalle.precioUnitario * detalle.cantidad),
                  vendedor: detalle.vendedorNombre || 'N/A',
                  fecha: pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-ES') : 'N/A',
                  estado: pedido.estado
                });
              });
            }
          });
          data = comprasDataList;
          break;
          
        case 'todos':
          // Obtener todos los datos combinados
          const [productos, pedidos, ventas] = await Promise.all([
            getProductosByUsuario(user.numeroDocumento),
            getPedidos(),
            getVentas()
          ]);
          
          // Mapear productos
          const productosData = productos.data.map(p => ({
            nombre: p.nombre,
            valor: p.precio,
            cantidad: p.stock,
            categoria: p.categoriaNombre || 'Sin categoría',
            descripcion: p.descripcion
          }));
          
          // Mapear pedidos
          const pedidosData = pedidos.data.map(p => ({
            fecha: new Date(p.fechaPedido).toLocaleDateString('es-ES'),
            valor: p.total,
            estado: p.estado,
            direccion: p.direccionEnvio,
            metodoPago: p.metodoPago
          }));
          
          // Mapear ventas
          const ventasData = ventas.data.map(v => ({
            producto: v.producto?.nombre || v.productoNombre || 'N/A',
            cantidad: v.cantidad,
            valor: v.precioUnitario,
            total: v.subtotal || (v.precioUnitario * v.cantidad),
            fecha: v.pedido?.fechaPedido ? new Date(v.pedido.fechaPedido).toLocaleDateString('es-ES') : 'N/A',
            estado: v.pedido?.estado || 'N/A'
          }));
          
          // Mapear compras
          const comprasData = [];
          pedidos.data.forEach(pedido => {
            if (pedido.detalles && Array.isArray(pedido.detalles)) {
              pedido.detalles.forEach(detalle => {
                comprasData.push({
                  producto: detalle.productoNombre || detalle.producto?.nombre || 'N/A',
                  cantidad: detalle.cantidad,
                  valor: detalle.precioUnitario,
                  total: detalle.subtotal || (detalle.precioUnitario * detalle.cantidad),
                  vendedor: detalle.vendedorNombre || 'N/A',
                  fecha: pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-ES') : 'N/A',
                  estado: pedido.estado
                });
              });
            }
          });
          
          data = {
            resumen: {
              productos: productos.data.length,
              pedidos: pedidos.data.length,
              ventas: ventas.data.length,
              totalVentas: ventas.data.reduce((sum, v) => sum + (v.subtotal || (v.precioUnitario * v.cantidad)), 0),
              totalCompras: pedidos.data.reduce((sum, p) => sum + (p.total || 0), 0)
            },
            productosDetalle: productosData,
            pedidosDetalle: pedidosData,
            ventasDetalle: ventasData,
            comprasDetalle: comprasData
          };
          break;
      }
      
      setReportData(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error al cargar reporte:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al cargar los datos del reporte. Por favor, intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      if (reportType === 'todos') {
        exportConsolidatedToExcel(reportData);
      } else if (Array.isArray(reportData) && reportData.length > 0) {
        exportSingleReportToExcel(reportData, reportType, getReportTitle());
      } else {
        alert('No hay datos para exportar');
      }
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al exportar a Excel. Por favor, intenta nuevamente.');
    }
  };

  const exportToPDF = () => {
    try {
      if (reportType === 'todos') {
        exportConsolidatedToPDF(reportData);
      } else if (Array.isArray(reportData) && reportData.length > 0) {
        exportSingleReportToPDF(reportData, reportType, getReportTitle());
      } else {
        alert('No hay datos para exportar');
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  };

  const getReportTitle = () => {
    const titles = {
      productos: 'Productos',
      pedidos: 'Pedidos',
      ventas: 'Ventas',
      compras: 'Compras',
      todos: 'Consolidado'
    };
    return titles[reportType] || 'Reporte';
  };

  const renderTableHeaders = () => {
    switch (reportType) {
      case 'productos':
        return (
          <tr>
            <th>Nombre</th>
            <th>Valor</th>
            <th>Cantidad</th>
            <th>Categoría</th>
            <th>Descripción</th>
          </tr>
        );
      case 'pedidos':
        return (
          <tr>
            <th>Fecha</th>
            <th>Valor</th>
            <th>Estado</th>
            <th>Dirección</th>
            <th>Método Pago</th>
          </tr>
        );
      case 'ventas':
        return (
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Valor Unit.</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        );
      case 'compras':
        return (
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Valor Unit.</th>
            <th>Total</th>
            <th>Vendedor</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    if (!Array.isArray(reportData) || reportData.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="text-center text-muted py-4">
            No hay datos para mostrar
          </td>
        </tr>
      );
    }

    switch (reportType) {
      case 'productos':
        return reportData.map((item, index) => (
          <tr key={index}>
            <td>{item.nombre}</td>
            <td>${item.valor?.toFixed(2)}</td>
            <td>{item.cantidad}</td>
            <td>{item.categoria}</td>
            <td className="text-truncate" style={{ maxWidth: '200px' }}>{item.descripcion}</td>
          </tr>
        ));
      case 'pedidos':
        return reportData.map((item, index) => (
          <tr key={index}>
            <td>{item.fecha}</td>
            <td>${item.valor?.toFixed(2)}</td>
            <td>
              <span className={`badge bg-${
                item.estado === 'ENTREGADO' ? 'success' :
                item.estado === 'CANCELADO' ? 'danger' :
                item.estado === 'EN_CAMINO' ? 'info' : 'warning'
              }`}>
                {item.estado}
              </span>
            </td>
            <td>{item.direccion}</td>
            <td>{item.metodoPago}</td>
          </tr>
        ));
      case 'ventas':
        return reportData.map((item, index) => (
          <tr key={index}>
            <td>{item.producto}</td>
            <td>{item.cantidad}</td>
            <td>${item.valor?.toFixed(2)}</td>
            <td>${item.total?.toFixed(2)}</td>
            <td>{item.fecha}</td>
            <td>
              <span className={`badge bg-${
                item.estado === 'ENTREGADO' ? 'success' :
                item.estado === 'CANCELADO' ? 'danger' :
                item.estado === 'EN_CAMINO' ? 'info' : 'warning'
              }`}>
                {item.estado}
              </span>
            </td>
          </tr>
        ));
      case 'compras':
        return reportData.map((item, index) => (
          <tr key={index}>
            <td>{item.producto}</td>
            <td>{item.cantidad}</td>
            <td>${item.valor?.toFixed(2)}</td>
            <td>${item.total?.toFixed(2)}</td>
            <td>{item.vendedor}</td>
            <td>{item.fecha}</td>
            <td>
              <span className={`badge bg-${
                item.estado === 'ENTREGADO' ? 'success' :
                item.estado === 'CANCELADO' ? 'danger' :
                item.estado === 'EN_CAMINO' ? 'info' : 'warning'
              }`}>
                {item.estado}
              </span>
            </td>
          </tr>
        ));
      default:
        return null;
    }
  };

  const renderConsolidatedReport = () => {
    if (!reportData || typeof reportData !== 'object') return null;

    const resumen = reportData.resumen || reportData;

    return (
      <>
        <Row className="mt-4">
          <Col md={6} lg={4} className="mb-3">
            <Card className="consolidated-summary-card">
              <Card.Body>
                <h5>📦 Total Productos</h5>
                <h2>{resumen.productos || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} className="mb-3">
            <Card className="consolidated-summary-card">
              <Card.Body>
                <h5>📋 Total Pedidos</h5>
                <h2>{resumen.pedidos || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} className="mb-3">
            <Card className="consolidated-summary-card">
              <Card.Body>
                <h5>💰 Total Ventas</h5>
                <h2>{resumen.ventas || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={6} className="mb-3">
            <Card className="consolidated-summary-card consolidated-card-success">
              <Card.Body>
                <h5>💵 Ingresos por Ventas</h5>
                <h2>
                  ${resumen.totalVentas?.toFixed(2) || '0.00'}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={6} className="mb-3">
            <Card className="consolidated-summary-card consolidated-card-info">
              <Card.Body>
                <h5>🛒 Total en Compras</h5>
                <h2>
                  ${resumen.totalCompras?.toFixed(2) || '0.00'}
                </h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tablas detalladas */}
        {reportData.productosDetalle && reportData.productosDetalle.length > 0 && (
          <Card className="consolidated-detail-card">
            <Card.Header className="consolidated-detail-header">
              <h5>📦 Productos</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead className="consolidated-detail-header">
                    <tr>
                      <th>Nombre</th>
                      <th>Valor</th>
                      <th>Cantidad</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.productosDetalle.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombre}</td>
                        <td>${item.valor?.toFixed(2)}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.categoria}</td>
                        <td className="text-truncate-custom">{item.descripcion}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {reportData.pedidosDetalle && reportData.pedidosDetalle.length > 0 && (
          <Card className="consolidated-detail-card">
            <Card.Header className="consolidated-detail-header">
              <h5>📋 Pedidos</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead className="consolidated-detail-header">
                    <tr>
                      <th>Fecha</th>
                      <th>Valor</th>
                      <th>Estado</th>
                      <th>Dirección</th>
                      <th>Método Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.pedidosDetalle.map((item, index) => (
                      <tr key={index}>
                        <td>{item.fecha}</td>
                        <td>${item.valor?.toFixed(2)}</td>
                        <td>
                          <span className={`badge bg-${
                            item.estado === 'ENTREGADO' ? 'success' :
                            item.estado === 'CANCELADO' ? 'danger' :
                            item.estado === 'EN_CAMINO' ? 'info' : 'warning'
                          }`}>
                            {item.estado}
                          </span>
                        </td>
                        <td>{item.direccion}</td>
                        <td>{item.metodoPago}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {reportData.ventasDetalle && reportData.ventasDetalle.length > 0 && (
          <Card className="consolidated-detail-card">
            <Card.Header className="consolidated-detail-header">
              <h5>💰 Ventas</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead className="consolidated-detail-header">
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Valor Unit.</th>
                      <th>Total</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.ventasDetalle.map((item, index) => (
                      <tr key={index}>
                        <td>{item.producto}</td>
                        <td>{item.cantidad}</td>
                        <td>${item.valor?.toFixed(2)}</td>
                        <td>${item.total?.toFixed(2)}</td>
                        <td>{item.fecha}</td>
                        <td>
                          <span className={`badge bg-${
                            item.estado === 'ENTREGADO' ? 'success' :
                            item.estado === 'CANCELADO' ? 'danger' :
                            item.estado === 'EN_CAMINO' ? 'info' : 'warning'
                          }`}>
                            {item.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {reportData.comprasDetalle && reportData.comprasDetalle.length > 0 && (
          <Card className="consolidated-detail-card">
            <Card.Header className="consolidated-detail-header">
              <h5>🛒 Compras</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead className="consolidated-detail-header">
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Valor Unit.</th>
                      <th>Total</th>
                      <th>Vendedor</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.comprasDetalle.map((item, index) => (
                      <tr key={index}>
                        <td>{item.producto}</td>
                        <td>{item.cantidad}</td>
                        <td>${item.valor?.toFixed(2)}</td>
                        <td>${item.total?.toFixed(2)}</td>
                        <td>{item.vendedor}</td>
                        <td>{item.fecha}</td>
                        <td>
                          <span className={`badge bg-${
                            item.estado === 'ENTREGADO' ? 'success' :
                            item.estado === 'CANCELADO' ? 'danger' :
                            item.estado === 'EN_CAMINO' ? 'info' : 'warning'
                          }`}>
                            {item.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </>
    );
  };

  return (
    <Container className="reports-container">
      <Card className="reports-header-card">
        <Card.Header>
          <div className="reports-title">
            <img 
              src={logo} 
              alt="Comuctiva Logo" 
              className="reports-logo"
            />
            <h3>📊 Reportes COMUCTIVA</h3>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="report-type-label">Tipo de Reporte:</Form.Label>
                <Form.Select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  className="report-type-select"
                >
                  <option value="productos">Productos</option>
                  <option value="pedidos">Pedidos</option>
                  <option value="compras">Compras</option>
                  <option value="ventas">Ventas</option>
                  <option value="todos">Todos (Consolidado)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8} className="report-actions">
              <Button 
                variant="success" 
                onClick={exportToExcel}
                className="me-2"
                disabled={loading || !reportData || (Array.isArray(reportData) && reportData.length === 0)}
              >
                📊 Exportar a Excel
              </Button>
              <Button 
                variant="danger" 
                onClick={exportToPDF}
                className="me-2"
                disabled={loading || !reportData || (Array.isArray(reportData) && reportData.length === 0)}
              >
                📄 Generar PDF
              </Button>
              <Button 
                variant="info" 
                onClick={loadReportData}
                disabled={loading}
              >
                🔄 Actualizar Datos
              </Button>
            </Col>
          </Row>

          {lastUpdate && (
            <small className="last-update">
              Última actualización: {lastUpdate.toLocaleString('es-ES')}
            </small>
          )}
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" variant="success" />
          <p className="loading-text">Cargando datos del reporte...</p>
        </div>
      ) : (
        <>
          {reportType === 'todos' ? (
            renderConsolidatedReport()
          ) : (
            <Card className="report-preview-card">
              <Card.Header className="report-preview-header">
                <h5 className="report-preview-title">Vista Previa - {getReportTitle()}</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table striped hover className="report-table mb-0">
                    <thead>
                      {renderTableHeaders()}
                    </thead>
                    <tbody>
                      {renderTableRows()}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {!loading && Array.isArray(reportData) && reportData.length === 0 && reportType !== 'todos' && (
        <Card className="report-empty-state">
          <Card.Body>
            <h4 className="text-muted">No hay datos para mostrar</h4>
            <p className="text-muted">Intenta con otro tipo de reporte o actualiza los datos.</p>
          </Card.Body>
        </Card>
      )}

      <div className="report-footer">
        <small>© {new Date().getFullYear()} COMUCTIVA - Todos los derechos reservados</small>
        <small>Documento generado automáticamente</small>
      </div>
    </Container>
  );
};

export default Reports;
