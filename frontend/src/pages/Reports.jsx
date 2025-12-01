import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  getProductosByUsuario, 
  getPedidos, 
  getVentas,
  getProductos 
} from '../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/images/logo.png';

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
        const wb = XLSX.utils.book_new();
        const resumen = reportData.resumen || reportData;
        
        // Hoja de resumen
        const headerData = [
          ['COMUCTIVA'],
          ['Plataforma de Comercio Comunitario'],
          ['Fecha: ' + new Date().toLocaleDateString('es-ES') + ' | Hora: ' + new Date().toLocaleTimeString('es-ES')],
          [''],
          ['Reporte de Resumen General'],
          [''],
          ['Metrica', 'Valor']
        ];
        
        const bodyData = [
          ['Total Productos', resumen.productos || 0],
          ['Total Pedidos', resumen.pedidos || 0],
          ['Total Ventas', resumen.ventas || 0],
          ['Ingresos por Ventas', '$' + (resumen.totalVentas || 0).toFixed(2)],
          ['Total en Compras', '$' + (resumen.totalCompras || 0).toFixed(2)]
        ];
        
        const footerData = [
          [''],
          ['© 2025 COMUCTIVA - Todos los derechos reservados'],
          ['Documento generado automaticamente']
        ];
        
        const wsResumen = XLSX.utils.aoa_to_sheet([...headerData, ...bodyData, ...footerData]);
        wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
        
        // Hoja de productos
        if (reportData.productosDetalle && reportData.productosDetalle.length > 0) {
          const productosHeader = [
            ['COMUCTIVA'],
            ['Plataforma de Comercio Comunitario'],
            ['Fecha: ' + new Date().toLocaleDateString('es-ES') + ' | Hora: ' + new Date().toLocaleTimeString('es-ES')],
            [''],
            ['Reporte de Productos'],
            ['']
          ];
          
          const productosData = reportData.productosDetalle.map(p => ({
            'Nombre': p.nombre,
            'Valor': '$' + (p.valor || 0).toFixed(2),
            'Cantidad': p.cantidad,
            'Categoria': p.categoria,
            'Descripcion': p.descripcion
          }));
          
          const wsProductos = XLSX.utils.json_to_sheet(productosData, { origin: 'A7' });
          XLSX.utils.sheet_add_aoa(wsProductos, productosHeader, { origin: 'A1' });
          wsProductos['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 40 }];
          XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos');
        }
        
        // Hoja de pedidos
        if (reportData.pedidosDetalle && reportData.pedidosDetalle.length > 0) {
          const pedidosHeader = [
            ['COMUCTIVA'],
            ['Plataforma de Comercio Comunitario'],
            ['Fecha: ' + new Date().toLocaleDateString('es-ES') + ' | Hora: ' + new Date().toLocaleTimeString('es-ES')],
            [''],
            ['Reporte de Pedidos'],
            ['']
          ];
          
          const pedidosData = reportData.pedidosDetalle.map(p => ({
            'Fecha': p.fecha,
            'Valor': '$' + (p.valor || 0).toFixed(2),
            'Estado': p.estado,
            'Direccion': p.direccion,
            'Metodo de Pago': p.metodoPago
          }));
          
          const wsPedidos = XLSX.utils.json_to_sheet(pedidosData, { origin: 'A7' });
          XLSX.utils.sheet_add_aoa(wsPedidos, pedidosHeader, { origin: 'A1' });
          wsPedidos['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, wsPedidos, 'Pedidos');
        }
        
        // Hoja de ventas
        if (reportData.ventasDetalle && reportData.ventasDetalle.length > 0) {
          const ventasHeader = [
            ['COMUCTIVA'],
            ['Plataforma de Comercio Comunitario'],
            ['Fecha: ' + new Date().toLocaleDateString('es-ES') + ' | Hora: ' + new Date().toLocaleTimeString('es-ES')],
            [''],
            ['Reporte de Ventas'],
            ['']
          ];
          
          const ventasData = reportData.ventasDetalle.map(v => ({
            'Producto': v.producto,
            'Cantidad': v.cantidad,
            'Valor Unitario': '$' + (v.valor || 0).toFixed(2),
            'Total': '$' + (v.total || 0).toFixed(2),
            'Fecha': v.fecha,
            'Estado': v.estado
          }));
          
          const wsVentas = XLSX.utils.json_to_sheet(ventasData, { origin: 'A7' });
          XLSX.utils.sheet_add_aoa(wsVentas, ventasHeader, { origin: 'A1' });
          wsVentas['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');
        }
        
        // Hoja de compras
        if (reportData.comprasDetalle && reportData.comprasDetalle.length > 0) {
          const comprasHeader = [
            ['COMUCTIVA'],
            ['Plataforma de Comercio Comunitario'],
            ['Fecha: ' + new Date().toLocaleDateString('es-ES') + ' | Hora: ' + new Date().toLocaleTimeString('es-ES')],
            [''],
            ['Reporte de Compras'],
            ['']
          ];
          
          const comprasData = reportData.comprasDetalle.map(c => ({
            'Producto': c.producto,
            'Cantidad': c.cantidad,
            'Valor Unitario': '$' + (c.valor || 0).toFixed(2),
            'Total': '$' + (c.total || 0).toFixed(2),
            'Vendedor': c.vendedor,
            'Fecha': c.fecha,
            'Estado': c.estado
          }));
          
          const wsCompras = XLSX.utils.json_to_sheet(comprasData, { origin: 'A7' });
          XLSX.utils.sheet_add_aoa(wsCompras, comprasHeader, { origin: 'A1' });
          wsCompras['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, wsCompras, 'Compras');
        }
        
        XLSX.writeFile(wb, 'COMUCTIVA_Reporte_Completo_' + new Date().toISOString().split('T')[0] + '.xlsx');
      } else if (Array.isArray(reportData) && reportData.length > 0) {
        const header = [
          ['COMUCTIVA'],
          ['Plataforma de Comercio Comunitario'],
          ['Fecha: ' + new Date().toLocaleDateString('es-ES') + ' | Hora: ' + new Date().toLocaleTimeString('es-ES')],
          [''],
          ['Reporte de ' + getReportTitle()],
          ['']
        ];
        
        const ws = XLSX.utils.json_to_sheet(reportData, { origin: 'A7' });
        XLSX.utils.sheet_add_aoa(ws, header, { origin: 'A1' });
        
        if (reportType === 'productos') {
          ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 40 }];
        } else if (reportType === 'pedidos') {
          ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];
        } else if (reportType === 'ventas') {
          ws['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
        } else if (reportType === 'compras') {
          ws['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }];
        }
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, getReportTitle());
        XLSX.writeFile(wb, 'COMUCTIVA_Reporte_' + reportType + '_' + new Date().toISOString().split('T')[0] + '.xlsx');
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
      const doc = new jsPDF();
      let currentPage = 1;
      
      // Función para agregar encabezado en cada página
      const addHeader = () => {
        // Fondo verde en el encabezado
        doc.setFillColor(26, 105, 43);
        doc.rect(0, 0, 210, 35, 'F');
        
        // Agregar logo
        try {
          doc.addImage(logo, 'PNG', 15, 8, 20, 20);
        } catch (e) {
          console.log('No se pudo agregar el logo');
        }
        
        // Título COMUCTIVA en blanco
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text('COMUCTIVA', 45, 18);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Plataforma de Comercio Comunitario', 45, 24);
        
        // Línea decorativa
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(15, 32, 195, 32);
        
        // Restablecer color de texto
        doc.setTextColor(0, 0, 0);
      };
      
      // Función para agregar pie de página
      const addFooter = (pageNum) => {
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `© ${new Date().getFullYear()} COMUCTIVA - Todos los derechos reservados`,
          105,
          doc.internal.pageSize.height - 15,
          { align: 'center' }
        );
        doc.text(
          'Documento generado automáticamente',
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          `Página ${pageNum}`,
          195,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      };
      
      // Agregar encabezado inicial
      addHeader();
      
      // Información del reporte
      doc.setFontSize(16);
      doc.setTextColor(26, 105, 43);
      doc.setFont(undefined, 'bold');
      doc.text(`Reporte de ${getReportTitle()}`, 105, 45, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
        105,
        51,
        { align: 'center' }
      );
      
      if (reportType === 'todos') {
        let currentY = 60;
        const resumen = reportData.resumen || reportData;
        
        // Reporte consolidado - Resumen
        doc.autoTable({
          startY: currentY,
          head: [['Métrica', 'Valor']],
          body: [
            ['Total Productos', resumen.productos || 0],
            ['Total Pedidos', resumen.pedidos || 0],
            ['Total Ventas', resumen.ventas || 0],
            ['Ingresos por Ventas', `$${(resumen.totalVentas || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
            ['Total en Compras', `$${(resumen.totalCompras || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
          ],
          theme: 'grid',
          headStyles: { 
            fillColor: [26, 105, 43],
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 10
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          margin: { left: 15, right: 15 }
        });
        
        currentY = doc.lastAutoTable.finalY + 20;
        
        // Tabla de Productos
        if (reportData.productosDetalle && reportData.productosDetalle.length > 0) {
          if (currentY > 240) {
            doc.addPage();
            currentPage++;
            addHeader();
            currentY = 45;
          }
          
          doc.setFontSize(14);
          doc.setTextColor(26, 105, 43);
          doc.setFont(undefined, 'bold');
          doc.text('Productos', 15, currentY);
          currentY += 8;
          
          const productosRows = reportData.productosDetalle.map(item => [
            item.nombre,
            `$${item.valor?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            item.cantidad,
            item.categoria,
            item.descripcion?.substring(0, 35) + (item.descripcion?.length > 35 ? '...' : '')
          ]);
          
          doc.autoTable({
            startY: currentY,
            head: [['Nombre', 'Valor', 'Cant.', 'Categoría', 'Descripción']],
            body: productosRows,
            theme: 'striped',
            headStyles: { 
              fillColor: [26, 105, 43],
              fontSize: 9,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 8
            },
            alternateRowStyles: {
              fillColor: [245, 250, 245]
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
              if (data.pageNumber > currentPage) {
                currentPage = data.pageNumber;
                addHeader();
              }
            }
          });
          
          currentY = doc.lastAutoTable.finalY + 15;
        }
        
        // Tabla de Pedidos
        if (reportData.pedidosDetalle && reportData.pedidosDetalle.length > 0) {
          if (currentY > 240) {
            doc.addPage();
            currentPage++;
            addHeader();
            currentY = 45;
          }
          
          doc.setFontSize(14);
          doc.setTextColor(26, 105, 43);
          doc.setFont(undefined, 'bold');
          doc.text('Pedidos', 15, currentY);
          currentY += 8;
          
          const pedidosRows = reportData.pedidosDetalle.map(item => [
            item.fecha,
            `$${item.valor?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            item.estado,
            item.direccion?.substring(0, 30) + (item.direccion?.length > 30 ? '...' : ''),
            item.metodoPago
          ]);
          
          doc.autoTable({
            startY: currentY,
            head: [['Fecha', 'Valor', 'Estado', 'Dirección', 'Pago']],
            body: pedidosRows,
            theme: 'striped',
            headStyles: { 
              fillColor: [26, 105, 43],
              fontSize: 9,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 8
            },
            alternateRowStyles: {
              fillColor: [245, 250, 245]
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
              if (data.pageNumber > currentPage) {
                currentPage = data.pageNumber;
                addHeader();
              }
            }
          });
          
          currentY = doc.lastAutoTable.finalY + 15;
        }
        
        // Tabla de Ventas
        if (reportData.ventasDetalle && reportData.ventasDetalle.length > 0) {
          if (currentY > 240) {
            doc.addPage();
            currentPage++;
            addHeader();
            currentY = 45;
          }
          
          doc.setFontSize(14);
          doc.setTextColor(26, 105, 43);
          doc.setFont(undefined, 'bold');
          doc.text('Ventas', 15, currentY);
          currentY += 8;
          
          const ventasRows = reportData.ventasDetalle.map(item => [
            item.producto?.substring(0, 20) + (item.producto?.length > 20 ? '...' : ''),
            item.cantidad,
            `$${item.valor?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            `$${item.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            item.fecha,
            item.estado
          ]);
          
          doc.autoTable({
            startY: currentY,
            head: [['Producto', 'Cant.', 'Valor Unit.', 'Total', 'Fecha', 'Estado']],
            body: ventasRows,
            theme: 'striped',
            headStyles: { 
              fillColor: [26, 105, 43],
              fontSize: 9,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 8
            },
            alternateRowStyles: {
              fillColor: [245, 250, 245]
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
              if (data.pageNumber > currentPage) {
                currentPage = data.pageNumber;
                addHeader();
              }
            }
          });
          
          currentY = doc.lastAutoTable.finalY + 15;
        }
        
        // Tabla de Compras
        if (reportData.comprasDetalle && reportData.comprasDetalle.length > 0) {
          if (currentY > 240) {
            doc.addPage();
            currentPage++;
            addHeader();
            currentY = 45;
          }
          
          doc.setFontSize(14);
          doc.setTextColor(26, 105, 43);
          doc.setFont(undefined, 'bold');
          doc.text('Compras', 15, currentY);
          currentY += 8;
          
          const comprasRows = reportData.comprasDetalle.map(item => [
            item.producto?.substring(0, 18) + (item.producto?.length > 18 ? '...' : ''),
            item.cantidad,
            `$${item.valor?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            `$${item.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            item.vendedor?.substring(0, 15) + (item.vendedor?.length > 15 ? '...' : ''),
            item.fecha,
            item.estado
          ]);
          
          doc.autoTable({
            startY: currentY,
            head: [['Producto', 'Cant.', 'Valor Unit.', 'Total', 'Vendedor', 'Fecha', 'Estado']],
            body: comprasRows,
            theme: 'striped',
            headStyles: { 
              fillColor: [26, 105, 43],
              fontSize: 8,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 7
            },
            alternateRowStyles: {
              fillColor: [245, 250, 245]
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
              if (data.pageNumber > currentPage) {
                currentPage = data.pageNumber;
                addHeader();
              }
            }
          });
        }
      } else {
        // Reporte individual
        if (!Array.isArray(reportData) || reportData.length === 0) {
          doc.setFontSize(12);
          doc.setTextColor(150, 150, 150);
          doc.text('No hay datos para mostrar', 105, 70, { align: 'center' });
        } else {
          const headers = Object.keys(reportData[0] || {});
          const rows = reportData.map(item => headers.map(key => {
            const value = item[key];
            // Formatear valores para evitar undefined en PDF
            if (value === null || value === undefined) return 'N/A';
            if (typeof value === 'number') return value.toFixed(2);
            return String(value);
          }));
          
          doc.autoTable({
            startY: 58,
            head: [headers],
            body: rows,
            theme: 'striped',
            headStyles: { 
              fillColor: [26, 105, 43],
              fontSize: 10,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 9
            },
            alternateRowStyles: {
              fillColor: [245, 250, 245]
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
              if (data.pageNumber > currentPage) {
                currentPage = data.pageNumber;
                addHeader();
              }
            }
          });
        }
      }
      
      // Agregar pie de página a todas las páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i);
      }
      
      doc.save(`COMUCTIVA_Reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
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
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="text-muted">📦 Total Productos</h5>
                <h2 className="mb-0">{resumen.productos || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="text-muted">📋 Total Pedidos</h5>
                <h2 className="mb-0">{resumen.pedidos || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="text-muted">💰 Total Ventas</h5>
                <h2 className="mb-0">{resumen.ventas || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={6} className="mb-3">
            <Card className="h-100 shadow-sm border-success">
              <Card.Body>
                <h5 className="text-success">💵 Ingresos por Ventas</h5>
                <h2 className="mb-0 text-success">
                  ${resumen.totalVentas?.toFixed(2) || '0.00'}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={6} className="mb-3">
            <Card className="h-100 shadow-sm border-info">
              <Card.Body>
                <h5 className="text-info">🛒 Total en Compras</h5>
                <h2 className="mb-0 text-info">
                  ${resumen.totalCompras?.toFixed(2) || '0.00'}
                </h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tablas detalladas */}
        {reportData.productosDetalle && reportData.productosDetalle.length > 0 && (
          <Card className="shadow-sm mb-4">
            <Card.Header style={{ backgroundColor: '#1a692b', color: 'white' }}>
              <h5 className="mb-0">📦 Productos</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead style={{ backgroundColor: '#1a692b', color: 'white' }}>
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
                        <td className="text-truncate" style={{ maxWidth: '200px' }}>{item.descripcion}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {reportData.pedidosDetalle && reportData.pedidosDetalle.length > 0 && (
          <Card className="shadow-sm mb-4">
            <Card.Header style={{ backgroundColor: '#1a692b', color: 'white' }}>
              <h5 className="mb-0">📋 Pedidos</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead style={{ backgroundColor: '#1a692b', color: 'white' }}>
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
          <Card className="shadow-sm mb-4">
            <Card.Header style={{ backgroundColor: '#1a692b', color: 'white' }}>
              <h5 className="mb-0">💰 Ventas</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead style={{ backgroundColor: '#1a692b', color: 'white' }}>
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
          <Card className="shadow-sm mb-4">
            <Card.Header style={{ backgroundColor: '#1a692b', color: 'white' }}>
              <h5 className="mb-0">🛒 Compras</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead style={{ backgroundColor: '#1a692b', color: 'white' }}>
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
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Header style={{ backgroundColor: '#1a692b', color: 'white' }}>
          <div className="d-flex align-items-center">
            <img 
              src={logo} 
              alt="Comuctiva Logo" 
              height="40"
              className="me-3"
              style={{ borderRadius: '5px' }}
            />
            <h3 className="mb-0">📊 Reportes COMUCTIVA</h3>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Tipo de Reporte:</Form.Label>
                <Form.Select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  style={{ borderColor: '#1a692b' }}
                >
                  <option value="productos">Productos</option>
                  <option value="pedidos">Pedidos</option>
                  <option value="compras">Compras</option>
                  <option value="ventas">Ventas</option>
                  <option value="todos">Todos (Consolidado)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8} className="text-end">
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
            <small className="text-muted">
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
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Cargando datos del reporte...</p>
        </div>
      ) : (
        <>
          {reportType === 'todos' ? (
            renderConsolidatedReport()
          ) : (
            <Card className="shadow-sm">
              <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                <h5 className="mb-0">Vista Previa - {getReportTitle()}</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table striped hover className="mb-0">
                    <thead style={{ backgroundColor: '#1a692b', color: 'white' }}>
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
        <Card className="shadow-sm text-center py-5">
          <Card.Body>
            <h4 className="text-muted">No hay datos para mostrar</h4>
            <p className="text-muted">Intenta con otro tipo de reporte o actualiza los datos.</p>
          </Card.Body>
        </Card>
      )}

      <div className="text-center mt-4 text-muted">
        <small>© {new Date().getFullYear()} COMUCTIVA - Todos los derechos reservados</small>
        <br />
        <small>Documento generado automáticamente</small>
      </div>
    </Container>
  );
};

export default Reports;
