/**
 * pdfExport.js
 * Módulo para exportar reportes a PDF con formato COMUCTIVA
 */
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/images/logo.png';

/**
 * Agrega el encabezado estándar de COMUCTIVA en cada página del PDF
 * @param {jsPDF} doc - Instancia del documento PDF
 */
const addHeader = (doc) => {
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

/**
 * Agrega el pie de página estándar de COMUCTIVA
 * @param {jsPDF} doc - Instancia del documento PDF
 * @param {number} pageNum - Número de página
 */
const addFooter = (doc, pageNum) => {
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

/**
 * Agrega información del reporte (título y fecha)
 * @param {jsPDF} doc - Instancia del documento PDF
 * @param {string} title - Título del reporte
 */
const addReportInfo = (doc, title) => {
  doc.setFontSize(16);
  doc.setTextColor(26, 105, 43);
  doc.setFont(undefined, 'bold');
  doc.text(`Reporte de ${title}`, 105, 45, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'normal');
  doc.text(
    `Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
    105,
    51,
    { align: 'center' }
  );
};

/**
 * Exporta el reporte consolidado a PDF
 * @param {Object} reportData - Datos del reporte
 * @returns {string} Nombre del archivo generado
 */
export const exportConsolidatedToPDF = (reportData) => {
  const doc = new jsPDF();
  let currentPage = 1;
  
  addHeader(doc);
  addReportInfo(doc, 'Consolidado');
  
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
      addHeader(doc);
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
          addHeader(doc);
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
      addHeader(doc);
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
          addHeader(doc);
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
      addHeader(doc);
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
          addHeader(doc);
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
      addHeader(doc);
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
          addHeader(doc);
        }
      }
    });
  }
  
  // Agregar pie de página a todas las páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }
  
  const fileName = `COMUCTIVA_Reporte_Completo_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Exporta un reporte individual a PDF
 * @param {Array} reportData - Datos del reporte
 * @param {string} reportType - Tipo de reporte
 * @param {string} reportTitle - Título del reporte
 * @returns {string} Nombre del archivo generado
 */
export const exportSingleReportToPDF = (reportData, reportType, reportTitle) => {
  const doc = new jsPDF();
  let currentPage = 1;
  
  addHeader(doc);
  addReportInfo(doc, reportTitle);
  
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
          addHeader(doc);
        }
      }
    });
  }
  
  // Agregar pie de página a todas las páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }
  
  const fileName = `COMUCTIVA_Reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Exporta reporte de auditoría administrativa a PDF
 * @param {Object} data - Datos del reporte administrativo
 * @returns {string} Nombre del archivo generado
 */
export const exportAdminAuditoriaToPDF = (data) => {
  const doc = new jsPDF();
  
  // Agregar encabezado
  addHeader(doc);
  
  // Título del reporte
  doc.setFontSize(16);
  doc.setTextColor(26, 105, 43);
  doc.setFont(undefined, 'bold');
  doc.text('Reporte de Auditoría Administrativa', 105, 45, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'normal');
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit' 
  })}`, 105, 52, { align: 'center' });
  
  let yPosition = 60;
  
  // Tabla de Usuarios
  if (data.usuariosDetalle && data.usuariosDetalle.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Usuarios', 'Cantidad']],
      body: data.usuariosDetalle.map(item => [item.concepto, item.valor]),
      theme: 'grid',
      headStyles: {
        fillColor: [26, 105, 43],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center', fontStyle: 'bold' }
      }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Tabla de Productos
  if (data.productosDetalle && data.productosDetalle.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Productos', 'Cantidad']],
      body: data.productosDetalle.map(item => [item.concepto, item.valor]),
      theme: 'grid',
      headStyles: {
        fillColor: [26, 105, 43],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center', fontStyle: 'bold' }
      }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Tabla de Pedidos
  if (data.pedidosDetalle && data.pedidosDetalle.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Pedidos', 'Cantidad']],
      body: data.pedidosDetalle.map(item => [item.concepto, item.valor]),
      theme: 'grid',
      headStyles: {
        fillColor: [26, 105, 43],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center', fontStyle: 'bold' }
      }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Tabla de Ventas
  if (data.ventasDetalle && data.ventasDetalle.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Ventas', 'Valor']],
      body: data.ventasDetalle.map(item => [item.concepto, item.valor]),
      theme: 'grid',
      headStyles: {
        fillColor: [26, 105, 43],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center', fontStyle: 'bold' }
      }
    });
  }
  
  // Agregar pie de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }
  
  const fileName = `COMUCTIVA_Auditoria_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  return fileName;
};
