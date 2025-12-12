import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Form, Alert } from 'react-bootstrap';
import { Download, FileText, TrendingUp, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import api from '../services/api';
import '../styles/Reports.css';
import { exportConsolidatedToExcel, exportAdminAuditoriaToExcel } from '../utils/excelExport';
import { exportConsolidatedToPDF, exportAdminAuditoriaToPDF } from '../utils/pdfExport';

const AdminAuditoria = () => {
  const [reportData, setReportData] = useState({
    usuarios: {
      total: 0,
      activos: 0,
      inactivos: 0,
      vendedores: 0,
      compradores: 0,
      administradores: 0
    },
    productos: {
      total: 0,
      activos: 0,
      inactivos: 0,
      sinStock: 0,
      conStock: 0,
      porCategoria: []
    },
    pedidos: {
      total: 0,
      pendientes: 0,
      enProceso: 0,
      entregados: 0,
      cancelados: 0
    },
    ventas: {
      total: 0,
      montoTotal: 0,
      promedio: 0,
      ultimoMes: 0
    },
    actividad: {
      registrosHoy: 0,
      pedidosHoy: 0,
      ventasHoy: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    inicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    setError('');
    try {
      // Cargar datos de usuarios
      const usuariosResponse = await api.get('/usuarios');
      const usuarios = Array.isArray(usuariosResponse.data) ? usuariosResponse.data : [];
      
      // Cargar datos de productos
      const productosResponse = await api.get('/productos');
      const productos = Array.isArray(productosResponse.data) ? productosResponse.data : [];
      
      // Cargar datos de pedidos - probar diferentes endpoints
      let pedidos = [];
      try {
        const pedidosResponse = await api.get('/pedidos');
        pedidos = Array.isArray(pedidosResponse.data) ? pedidosResponse.data : [];
      } catch (err) {
        console.log('Error con /pedidos, intentando /pedidos/all');
        try {
          const pedidosResponse = await api.get('/pedidos/all');
          pedidos = Array.isArray(pedidosResponse.data) ? pedidosResponse.data : [];
        } catch (err2) {
          console.log('Error cargando pedidos:', err2);
        }
      }
      
      // Obtener IDs únicos de vendedores desde productos
      const vendedoresDesdeProductos = new Set();
      productos.forEach(p => {
        // Intentar obtener el ID del vendedor de diferentes formas
        const vendedorId = p.usuarioId || p.vendedorId || p.usuario?.id || p.vendedor?.id || 
                          p.usuarioDocumento || p.vendedor?.documento;
        if (vendedorId) {
          vendedoresDesdeProductos.add(vendedorId);
        }
      });
      
      // Obtener IDs únicos de compradores desde pedidos
      const compradoresDesdePedidos = new Set();
      pedidos.forEach(p => {
        // Intentar obtener el ID del comprador de diferentes formas
        const compradorId = p.usuarioId || p.compradorId || p.usuario?.id || p.comprador?.id ||
                           p.usuarioDocumento || p.usuario?.documento;
        if (compradorId) {
          compradoresDesdePedidos.add(compradorId);
        }
      });

      // Procesar estadísticas de usuarios
      const usuariosStats = {
        total: usuarios.length,
        activos: usuarios.filter(u => u.activo === true || u.activo === 1 || u.activo === '1').length,
        inactivos: usuarios.filter(u => u.activo === false || u.activo === 0 || u.activo === '0').length,
        vendedores: vendedoresDesdeProductos.size, // Vendedores reales con productos
        compradores: compradoresDesdePedidos.size, // Compradores reales con pedidos
        administradores: usuarios.filter(u => u.rol === 'ADMIN' || u.rol === 'admin').length
      };

      // Procesar estadísticas de productos
      const categorias = {};
      productos.forEach(p => {
        // Verificar si tiene categoría y obtener el nombre correctamente
        let cat = 'Sin categoría';
        if (p.categoria) {
          if (typeof p.categoria === 'string') {
            cat = p.categoria;
          } else if (p.categoria.nombre) {
            cat = p.categoria.nombre;
          } else if (p.categoria.name) {
            cat = p.categoria.name;
          }
        } else if (p.categoriaNombre) {
          cat = p.categoriaNombre;
        } else if (p.category) {
          cat = typeof p.category === 'string' ? p.category : p.category.nombre || p.category.name;
        }
        categorias[cat] = (categorias[cat] || 0) + 1;
      });

      const productosStats = {
        total: productos.length,
        activos: productos.filter(p => p.activo === true || p.activo === 1 || p.activo === '1').length,
        inactivos: productos.filter(p => p.activo === false || p.activo === 0 || p.activo === '0').length,
        sinStock: productos.filter(p => {
          const cant = parseInt(p.cantidad || p.stock || 0);
          return cant === 0 || cant < 1;
        }).length,
        conStock: productos.filter(p => {
          const cant = parseInt(p.cantidad || p.stock || 0);
          return cant > 0;
        }).length,
        porCategoria: Object.entries(categorias)
          .map(([nombre, cantidad]) => ({ nombre, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad) // Ordenar de mayor a menor
      };

      // Procesar estadísticas de pedidos - USAR estadoPedido
      const pedidosStats = {
        total: pedidos.length,
        pendientes: pedidos.filter(p => {
          const est = (p.estadoPedido || p.estado || '').toUpperCase();
          return est === 'PENDIENTE' || est === 'PENDING';
        }).length,
        enProceso: pedidos.filter(p => {
          const est = (p.estadoPedido || p.estado || '').toUpperCase();
          return est === 'EN_PROCESO' || est === 'ENVIADO' ||
                 est === 'EN PROCESO' || est === 'PROCESSING';
        }).length,
        entregados: pedidos.filter(p => {
          const est = (p.estadoPedido || p.estado || '').toUpperCase();
          return est === 'ENTREGADO' || est === 'COMPLETADO' ||
                 est === 'DELIVERED' || est === 'COMPLETED';
        }).length,
        cancelados: pedidos.filter(p => {
          const est = (p.estadoPedido || p.estado || '').toUpperCase();
          return est === 'CANCELADO' || est === 'CANCELLED';
        }).length
      };
      
      console.log('Pedidos Stats:', pedidosStats);

      console.log('Pedidos Stats:', pedidosStats);

      // Procesar estadísticas de ventas - TODAS LAS VENTAS GENERALES (todos los pedidos entregados)
      const pedidosEntregados = pedidos.filter(p => {
        const estado = (p.estadoPedido || p.estado || '').toUpperCase();
        return estado === 'ENTREGADO' || estado === 'COMPLETADO' || 
               estado === 'DELIVERED' || estado === 'COMPLETED';
      });
      
      const ventasTotal = pedidosEntregados.reduce((sum, p) => {
        const monto = parseFloat(
          p.total || p.costoFlete || p.monto || p.totalPagar || 
          p.montoTotal || p.precioTotal || p.amount || 0
        );
        return sum + monto;
      }, 0);
      
      const ventasCantidad = pedidosEntregados.length;
      
      console.log('Monto total ventas:', ventasTotal);
      
      // Calcular ventas del último mes
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);
      
      const ventasUltimoMes = pedidosEntregados
        .filter(p => {
          if (!p.fechaPedido && !p.fecha && !p.createdAt && !p.fechaCreacion) return false;
          const fechaPedido = new Date(p.fechaPedido || p.fecha || p.createdAt || p.fechaCreacion);
          return fechaPedido >= haceUnMes;
        })
        .reduce((sum, p) => {
          const monto = parseFloat(
            p.total || p.costoFlete || p.monto || p.totalPagar || 
            p.montoTotal || p.precioTotal || p.amount || 0
          );
          return sum + monto;
        }, 0);
      
      const ventasStats = {
        total: ventasCantidad,
        montoTotal: ventasTotal,
        promedio: ventasCantidad > 0 ? ventasTotal / ventasCantidad : 0,
        ultimoMes: ventasUltimoMes
      };

      // Procesar actividad del día
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const hoyString = hoy.toISOString().split('T')[0];
      
      const actividadStats = {
        registrosHoy: usuarios.filter(u => {
          if (!u.fechaRegistro && !u.createdAt && !u.fechaCreacion) return false;
          const fechaReg = (u.fechaRegistro || u.createdAt || u.fechaCreacion || '').split('T')[0];
          return fechaReg === hoyString;
        }).length,
        
        pedidosHoy: pedidos.filter(p => {
          if (!p.fechaPedido && !p.fecha && !p.createdAt && !p.fechaCreacion) return false;
          const fechaPed = (p.fechaPedido || p.fecha || p.createdAt || p.fechaCreacion || '').split('T')[0];
          return fechaPed === hoyString;
        }).length,
        
        ventasHoy: pedidos
          .filter(p => {
            if (!p.fechaPedido && !p.fecha && !p.createdAt && !p.fechaCreacion) return false;
            const fechaPed = (p.fechaPedido || p.fecha || p.createdAt || p.fechaCreacion || '').split('T')[0];
            const estado = (p.estadoPedido || p.estado || '').toUpperCase();
            return fechaPed === hoyString && (
              estado === 'ENTREGADO' || estado === 'COMPLETADO' ||
              estado === 'DELIVERED' || estado === 'COMPLETED'
            );
          })
          .reduce((sum, p) => {
            const monto = parseFloat(
              p.total || p.costoFlete || p.monto || p.totalPagar || 
              p.montoTotal || p.precioTotal || p.amount || 0
            );
            return sum + monto;
          }, 0)
      };

      setReportData({
        usuarios: usuariosStats,
        productos: productosStats,
        pedidos: pedidosStats,
        ventas: ventasStats,
        actividad: actividadStats
      });

    } catch (error) {
      console.error('Error al cargar datos del reporte:', error);
      setError('Error al cargar los datos del reporte: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      // Validar que los datos estén cargados
      if (!reportData || !reportData.usuarios || !reportData.productos) {
        setError('Por favor espera a que los datos se carguen completamente');
        return;
      }

      const dataForExport = {
        usuariosDetalle: [
          { concepto: 'Total Usuarios', valor: reportData.usuarios?.total || 0 },
          { concepto: 'Usuarios Activos', valor: reportData.usuarios?.activos || 0 },
          { concepto: 'Usuarios Inactivos', valor: reportData.usuarios?.inactivos || 0 },
          { concepto: 'Vendedores', valor: reportData.usuarios?.vendedores || 0 },
          { concepto: 'Compradores', valor: reportData.usuarios?.compradores || 0 },
          { concepto: 'Administradores', valor: reportData.usuarios?.administradores || 0 }
        ],
        productosDetalle: [
          { concepto: 'Total Productos', valor: reportData.productos?.total || 0 },
          { concepto: 'Productos Activos', valor: reportData.productos?.activos || 0 },
          { concepto: 'Productos Inactivos', valor: reportData.productos?.inactivos || 0 },
          { concepto: 'Sin Stock', valor: reportData.productos?.sinStock || 0 },
          { concepto: 'Con Stock', valor: reportData.productos?.conStock || 0 }
        ],
        pedidosDetalle: [
          { concepto: 'Total Pedidos', valor: reportData.pedidos?.total || 0 },
          { concepto: 'Pendientes', valor: reportData.pedidos?.pendientes || 0 },
          { concepto: 'En Proceso', valor: reportData.pedidos?.enProceso || 0 },
          { concepto: 'Entregados', valor: reportData.pedidos?.entregados || 0 },
          { concepto: 'Cancelados', valor: reportData.pedidos?.cancelados || 0 }
        ],
        ventasDetalle: [
          { concepto: 'Total Ventas', valor: reportData.ventas?.total || 0 },
          { concepto: 'Monto Total', valor: `$${(reportData.ventas?.montoTotal || 0).toFixed(2)}` },
          { concepto: 'Promedio por Venta', valor: `$${(reportData.ventas?.promedio || 0).toFixed(2)}` },
          { concepto: 'Ventas Último Mes', valor: `$${(reportData.ventas?.ultimoMes || 0).toFixed(2)}` }
        ]
      };

      exportAdminAuditoriaToPDF(dataForExport);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      setError('Error al exportar a PDF');
    }
  };

  const handleExportExcel = () => {
    try {
      // Validar que los datos estén cargados
      if (!reportData || !reportData.usuarios || !reportData.productos) {
        setError('Por favor espera a que los datos se carguen completamente');
        return;
      }

      exportAdminAuditoriaToExcel(reportData);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      setError('Error al exportar a Excel');
    }
  };
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <Card className="reports-header-card mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-2">
                <FileText className="me-2" size={28} />
                Reportes de Auditoría
              </h2>
              <p className="text-muted mb-0">Panel de control administrativo y estadísticas generales</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-success" onClick={handleExportPDF}>
                <Download size={18} className="me-2" />
                Exportar PDF
              </Button>
              <Button variant="success" onClick={handleExportExcel}>
                <Download size={18} className="me-2" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Actividad del Día */}
      <Card className="mb-4">
        <Card.Header className="bg-success text-white">
          <h5 className="mb-0">
            <TrendingUp size={20} className="me-2" />
            Actividad de Hoy
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <div className="text-center p-3 border rounded">
                <Users size={32} className="text-success mb-2" />
                <h3 className="mb-1">{reportData.actividad.registrosHoy}</h3>
                <p className="text-muted mb-0">Nuevos Registros</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 border rounded">
                <ShoppingCart size={32} className="text-success mb-2" />
                <h3 className="mb-1">{reportData.actividad.pedidosHoy}</h3>
                <p className="text-muted mb-0">Pedidos Hoy</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 border rounded">
                <DollarSign size={32} className="text-success mb-2" />
                <h3 className="mb-1">${reportData.actividad.ventasHoy.toFixed(2)}</h3>
                <p className="text-muted mb-0">Ventas Hoy</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        {/* Estadísticas de Usuarios */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <Users size={20} className="me-2" />
                Usuarios
              </h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover className="report-table">
                <tbody>
                  <tr>
                    <td><strong>Total Usuarios</strong></td>
                    <td className="text-end">{reportData.usuarios.total}</td>
                  </tr>
                  <tr>
                    <td>Usuarios Activos</td>
                    <td className="text-end text-success">{reportData.usuarios.activos}</td>
                  </tr>
                  <tr>
                    <td>Usuarios Inactivos</td>
                    <td className="text-end text-danger">{reportData.usuarios.inactivos}</td>
                  </tr>
                  <tr>
                    <td>Vendedores</td>
                    <td className="text-end">{reportData.usuarios.vendedores}</td>
                  </tr>
                  <tr>
                    <td>Compradores</td>
                    <td className="text-end">{reportData.usuarios.compradores}</td>
                  </tr>
                  <tr>
                    <td>Administradores</td>
                    <td className="text-end">{reportData.usuarios.administradores}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Estadísticas de Productos */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <Package size={20} className="me-2" />
                Productos
              </h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover className="report-table">
                <tbody>
                  <tr>
                    <td><strong>Total Productos</strong></td>
                    <td className="text-end">{reportData.productos.total}</td>
                  </tr>
                  <tr>
                    <td>Productos Activos</td>
                    <td className="text-end text-success">{reportData.productos.activos}</td>
                  </tr>
                  <tr>
                    <td>Productos Inactivos</td>
                    <td className="text-end text-danger">{reportData.productos.inactivos}</td>
                  </tr>
                  <tr>
                    <td>Con Stock</td>
                    <td className="text-end text-success">{reportData.productos.conStock}</td>
                  </tr>
                  <tr>
                    <td>Sin Stock</td>
                    <td className="text-end text-warning">{reportData.productos.sinStock}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Estadísticas de Pedidos */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <ShoppingCart size={20} className="me-2" />
                Pedidos
              </h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover className="report-table">
                <tbody>
                  <tr>
                    <td><strong>Total Pedidos</strong></td>
                    <td className="text-end">{reportData.pedidos.total}</td>
                  </tr>
                  <tr>
                    <td>Pendientes</td>
                    <td className="text-end text-warning">{reportData.pedidos.pendientes}</td>
                  </tr>
                  <tr>
                    <td>En Proceso</td>
                    <td className="text-end text-info">{reportData.pedidos.enProceso}</td>
                  </tr>
                  <tr>
                    <td>Entregados</td>
                    <td className="text-end text-success">{reportData.pedidos.entregados}</td>
                  </tr>
                  <tr>
                    <td>Cancelados</td>
                    <td className="text-end text-danger">{reportData.pedidos.cancelados}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Estadísticas de Ventas */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <DollarSign size={20} className="me-2" />
                Ventas
              </h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover className="report-table">
                <tbody>
                  <tr>
                    <td><strong>Total Ventas</strong></td>
                    <td className="text-end">{reportData.ventas.total}</td>
                  </tr>
                  <tr>
                    <td>Monto Total</td>
                    <td className="text-end text-success">
                      <strong>${reportData.ventas.montoTotal.toFixed(2)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Promedio por Venta</td>
                    <td className="text-end">${reportData.ventas.promedio.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Ventas Último Mes</td>
                    <td className="text-end text-info">${reportData.ventas.ultimoMes.toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Productos por Categoría */}
      {reportData.productos.porCategoria.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">
              <Package size={20} className="me-2" />
              Productos por Categoría
            </h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover className="report-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="text-end">Cantidad de Productos</th>
                </tr>
              </thead>
              <tbody>
                {reportData.productos.porCategoria.map((cat, index) => (
                  <tr key={index}>
                    <td>{cat.nombre}</td>
                    <td className="text-end">{cat.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AdminAuditoria;
