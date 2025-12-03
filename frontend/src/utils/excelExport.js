/**
 * excelExport.js
 * Módulo para exportar reportes a Excel con formato COMUCTIVA
 */
import * as XLSX from 'xlsx-js-style';

/**
 * Crea el encabezado estándar de COMUCTIVA para Excel con formato
 * @param {string} reportTitle - Título del reporte
 * @returns {Array} Array con las filas del encabezado
 */
const createExcelHeader = (reportTitle) => {
  return [
    ['🌱 COMUCTIVA'],
    ['Plataforma de Comercio Comunitario'],
    ['Fecha: ' + new Date().toLocaleDateString('es-ES') + ' | Hora: ' + new Date().toLocaleTimeString('es-ES')],
    [''],
    ['Reporte de ' + reportTitle],
    ['']
  ];
};

/**
 * Crea el pie de página estándar de COMUCTIVA para Excel
 * @returns {Array} Array con las filas del pie de página
 */
const createExcelFooter = () => {
  return [
    [''],
    ['© 2025 COMUCTIVA - Todos los derechos reservados'],
    ['Documento generado automaticamente']
  ];
};

/**
 * Agrega formato visual a una hoja de Excel
 * @param {Object} worksheet - Hoja de trabajo
 * @param {number} numCols - Número de columnas
 */
const formatWorksheet = (worksheet, numCols) => {
  if (!worksheet['!margins']) {
    worksheet['!margins'] = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
  }
};

/**
 * Aplica estilos de color al encabezado
 * @param {Object} ws - Hoja de trabajo
 * @param {number} numCols - Número de columnas
 */
const applyHeaderStyles = (ws, numCols) => {
  // Fusionar celdas para el encabezado - solo hasta el número de columnas de la tabla
  const mergeRange = numCols - 1;
  if (!ws['!merges']) ws['!merges'] = [];
  
  // Fusionar fila 1 (COMUCTIVA) - de A1 hasta la última columna de la tabla
  ws['!merges'].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: mergeRange }
  });
  
  // Fusionar fila 2 (Plataforma) - de A2 hasta la última columna de la tabla
  ws['!merges'].push({
    s: { r: 1, c: 0 },
    e: { r: 1, c: mergeRange }
  });
  
  // Fusionar fila 3 (Fecha) - de A3 hasta la última columna de la tabla
  ws['!merges'].push({
    s: { r: 2, c: 0 },
    e: { r: 2, c: mergeRange }
  });
  
  // Estilo para COMUCTIVA con logo (A1) - fondo verde claro y CENTRADO
  if (ws['A1']) {
    ws['A1'].s = {
      font: { name: 'Calibri', sz: 20, bold: true, color: { rgb: '1A692B' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { patternType: 'solid', fgColor: { rgb: 'E8F5E9' } }
    };
  }
  
  // Estilo para subtítulo (A2) - fondo verde claro y CENTRADO
  if (ws['A2']) {
    ws['A2'].s = {
      font: { name: 'Calibri', sz: 11, italic: true, color: { rgb: '1A692B' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { patternType: 'solid', fgColor: { rgb: 'E8F5E9' } }
    };
  }
  
  // Estilo para fecha (A3) - fondo verde claro y CENTRADO
  if (ws['A3']) {
    ws['A3'].s = {
      font: { name: 'Calibri', sz: 9, color: { rgb: '666666' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { patternType: 'solid', fgColor: { rgb: 'E8F5E9' } }
    };
  }
  
  // Aplicar fondo verde claro a todas las columnas de las filas 1-3
  for (let row = 0; row < 3; row++) {
    for (let col = 1; col <= mergeRange; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
      ws[cellRef].s = {
        fill: { patternType: 'solid', fgColor: { rgb: 'E8F5E9' } }
      };
    }
  }
  
  // Línea divisoria verde (fila 4) - toda la fila con fondo verde oscuro
  for (let col = 0; col <= mergeRange; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 3, c: col });
    if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
    ws[cellRef].s = {
      fill: { patternType: 'solid', fgColor: { rgb: '1A692B' } }
    };
  }
  
  // Establecer altura de la línea verde
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][3] = { hpt: 8 };
  
  // Estilo para título del reporte (A5) - SIN fondo
  if (ws['A5']) {
    ws['A5'].s = {
      font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: '1A692B' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
};

/**
 * Aplica estilos a las cabeceras de tabla
 * @param {Object} ws - Hoja de trabajo
 * @param {number} startRow - Fila donde comienza la tabla
 * @param {number} numCols - Número de columnas
 */
const applyTableHeaderStyles = (ws, startRow, numCols) => {
  const headerStyle = {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: '1A692B' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'medium', color: { rgb: '1A692B' } },
      bottom: { style: 'medium', color: { rgb: '1A692B' } },
      left: { style: 'thin', color: { rgb: 'FFFFFF' } },
      right: { style: 'thin', color: { rgb: 'FFFFFF' } }
    }
  };
  
  // Establecer altura de fila para el encabezado
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][startRow - 1] = { hpt: 25 };
  
  for (let col = 0; col < numCols; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: startRow - 1, c: col });
    if (ws[cellRef]) {
      ws[cellRef].s = headerStyle;
    }
  }
};

/**
 * Aplica estilos a las filas de datos
 * @param {Object} ws - Hoja de trabajo
 * @param {number} startRow - Fila de inicio de datos
 * @param {number} endRow - Fila final de datos
 * @param {number} numCols - Número de columnas
 */
const applyDataRowStyles = (ws, startRow, endRow, numCols) => {
  if (!ws['!rows']) ws['!rows'] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    const isEvenRow = (row - startRow) % 2 === 0;
    ws['!rows'][row - 1] = { hpt: 18 };
    
    for (let col = 0; col < numCols; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { name: 'Calibri', sz: 10, color: { rgb: '333333' } },
          fill: {
            patternType: 'solid',
            fgColor: { rgb: isEvenRow ? 'E8F5E9' : 'FFFFFF' }
          },
          alignment: { horizontal: col === 0 ? 'left' : 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'hair', color: { rgb: 'C8E6C9' } },
            bottom: { style: 'hair', color: { rgb: 'C8E6C9' } },
            left: { style: 'hair', color: { rgb: 'C8E6C9' } },
            right: { style: 'hair', color: { rgb: 'C8E6C9' } }
          }
        };
      }
    }
  }
};

/**
 * Aplica estilos al pie de página
 * @param {Object} ws - Hoja de trabajo
 * @param {number} footerStartRow - Fila donde comienza el pie
 * @param {number} numCols - Número de columnas
 */
const applyFooterStyles = (ws, footerStartRow, numCols) => {
  // Línea divisoria antes del footer
  const dividerRow = footerStartRow - 1;
  for (let col = 0; col < numCols; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: dividerRow, c: col });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        border: { top: { style: 'thin', color: { rgb: '1A692B' } } }
      };
    }
  }
  
  // Estilos para las líneas del footer
  for (let i = 0; i < 2; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: footerStartRow + i, c: 0 });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { name: 'Calibri', sz: 9, italic: true, color: { rgb: '1A692B' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { patternType: 'solid', fgColor: { rgb: 'F9FBF9' } }
      };
    }
  }
};

/**
 * Exporta el reporte consolidado a Excel con formato mejorado
 * @param {Object} reportData - Datos del reporte
 * @returns {string} Nombre del archivo generado
 */
export const exportConsolidatedToExcel = (reportData) => {
  const wb = XLSX.utils.book_new();
  const resumen = reportData.resumen || reportData;
  
  // Hoja de resumen
  const headerData = createExcelHeader('Resumen General');
  
  const bodyData = [
    ['METRICA', 'VALOR'],
    ['Total Productos', resumen.productos || 0],
    ['Total Pedidos', resumen.pedidos || 0],
    ['Total Ventas', resumen.ventas || 0],
    ['Ingresos por Ventas', '$' + (resumen.totalVentas || 0).toFixed(2)],
    ['Total en Compras', '$' + (resumen.totalCompras || 0).toFixed(2)]
  ];
  
  const footerData = createExcelFooter();
  
  const wsResumen = XLSX.utils.aoa_to_sheet([...headerData, ...bodyData, ...footerData]);
  wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }];
  
  // Aplicar estilos al resumen
  applyHeaderStyles(wsResumen, 2);
  applyTableHeaderStyles(wsResumen, 7, 2);
  applyDataRowStyles(wsResumen, 8, 7 + bodyData.length - 1, 2);
  applyFooterStyles(wsResumen, headerData.length + bodyData.length + 1, 2);
  formatWorksheet(wsResumen, 2);
  
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  
  // Hoja de productos
  if (reportData.productosDetalle && reportData.productosDetalle.length > 0) {
    const productosHeader = createExcelHeader('Productos');
    
    const productosData = reportData.productosDetalle.map(p => ({
      'Nombre': p.nombre,
      'Valor': '$' + (p.valor || 0).toFixed(2),
      'Cantidad': p.cantidad,
      'Categoria': p.categoria,
      'Descripcion': p.descripcion
    }));
    
    const wsProductos = XLSX.utils.json_to_sheet(productosData, { origin: 'A7' });
    XLSX.utils.sheet_add_aoa(wsProductos, productosHeader, { origin: 'A1' });
    wsProductos['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 40 }];
    
    // Aplicar estilos a productos
    applyHeaderStyles(wsProductos, 5);
    applyTableHeaderStyles(wsProductos, 7, 5);
    applyDataRowStyles(wsProductos, 8, 7 + productosData.length, 5);
    formatWorksheet(wsProductos, 5);
    
    XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos');
  }
  
  // Hoja de pedidos
  if (reportData.pedidosDetalle && reportData.pedidosDetalle.length > 0) {
    const pedidosHeader = createExcelHeader('Pedidos');
    
    const pedidosData = reportData.pedidosDetalle.map(p => ({
      'Fecha': p.fecha,
      'Valor': '$' + (p.valor || 0).toFixed(2),
      'Estado': p.estado,
      'Direccion': p.direccion,
      'Metodo de Pago': p.metodoPago
    }));
    
    const wsPedidos = XLSX.utils.json_to_sheet(pedidosData, { origin: 'A7' });
    XLSX.utils.sheet_add_aoa(wsPedidos, pedidosHeader, { origin: 'A1' });
    wsPedidos['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 18 }];
    
    // Aplicar estilos a pedidos
    applyHeaderStyles(wsPedidos, 5);
    applyTableHeaderStyles(wsPedidos, 7, 5);
    applyDataRowStyles(wsPedidos, 8, 7 + pedidosData.length, 5);
    formatWorksheet(wsPedidos, 5);
    
    XLSX.utils.book_append_sheet(wb, wsPedidos, 'Pedidos');
  }
  
  // Hoja de ventas
  if (reportData.ventasDetalle && reportData.ventasDetalle.length > 0) {
    const ventasHeader = createExcelHeader('Ventas');
    
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
    wsVentas['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
    
    // Aplicar estilos a ventas
    applyHeaderStyles(wsVentas, 6);
    applyTableHeaderStyles(wsVentas, 7, 6);
    applyDataRowStyles(wsVentas, 8, 7 + ventasData.length, 6);
    formatWorksheet(wsVentas, 6);
    
    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');
  }
  
  // Hoja de compras
  if (reportData.comprasDetalle && reportData.comprasDetalle.length > 0) {
    const comprasHeader = createExcelHeader('Compras');
    
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
    wsCompras['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 15 }];
    
    // Aplicar estilos a compras
    applyHeaderStyles(wsCompras, 7);
    applyTableHeaderStyles(wsCompras, 7, 7);
    applyDataRowStyles(wsCompras, 8, 7 + comprasData.length, 7);
    formatWorksheet(wsCompras, 7);
    
    XLSX.utils.book_append_sheet(wb, wsCompras, 'Compras');
  }
  
  const fileName = 'COMUCTIVA_Reporte_Completo_' + new Date().toISOString().split('T')[0] + '.xlsx';
  XLSX.writeFile(wb, fileName);
  return fileName;
};

/**
 * Exporta reporte de auditoría administrativa a Excel con formato claro
 * @param {Object} reportData - Datos del reporte administrativo
 * @returns {string} Nombre del archivo generado
 */
export const exportAdminAuditoriaToExcel = (reportData) => {
  const wb = XLSX.utils.book_new();
  
  // Hoja de resumen general
  const headerData = createExcelHeader('Auditoría Administrativa');
  
  const resumenData = [
    ['SECCION', 'TOTAL'],
    ['Total de Usuarios', reportData.usuarios?.total || 0],
    ['Total de Productos', reportData.productos?.total || 0],
    ['Total de Pedidos', reportData.pedidos?.total || 0],
    ['Monto Total en Ventas', '$' + ((reportData.ventas?.montoTotal || 0).toLocaleString('es-CO'))]
  ];
  
  const footerData = createExcelFooter();
  
  const wsResumen = XLSX.utils.aoa_to_sheet([...headerData, ...resumenData, ...footerData]);
  wsResumen['!cols'] = [{ wch: 35 }, { wch: 25 }];
  
  // Aplicar estilos al resumen
  applyHeaderStyles(wsResumen, 2);
  applyTableHeaderStyles(wsResumen, 7, 2);
  applyDataRowStyles(wsResumen, 8, 7 + resumenData.length - 1, 2);
  applyFooterStyles(wsResumen, headerData.length + resumenData.length + 1, 2);
  formatWorksheet(wsResumen, 2);
  
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General');
  
  // Hoja de Usuarios
  const usuariosHeader = createExcelHeader('Estadísticas de Usuarios');
  const usuariosData = [
    ['CONCEPTO', 'CANTIDAD'],
    ['Total de usuarios', reportData.usuarios?.total || 0],
    ['Usuarios activos', reportData.usuarios?.activos || 0],
    ['Usuarios inactivos', reportData.usuarios?.inactivos || 0],
    ['Administradores', reportData.usuarios?.administradores || 0],
    ['Vendedores', reportData.usuarios?.vendedores || 0],
    ['Compradores', reportData.usuarios?.compradores || 0]
  ];
  
  const wsUsuarios = XLSX.utils.aoa_to_sheet([...usuariosHeader, ...usuariosData]);
  wsUsuarios['!cols'] = [{ wch: 35 }, { wch: 20 }];
  
  applyHeaderStyles(wsUsuarios, 2);
  applyTableHeaderStyles(wsUsuarios, 7, 2);
  applyDataRowStyles(wsUsuarios, 8, 7 + usuariosData.length - 1, 2);
  formatWorksheet(wsUsuarios, 2);
  
  XLSX.utils.book_append_sheet(wb, wsUsuarios, 'Usuarios');
  
  // Hoja de Productos
  const productosHeader = createExcelHeader('Estadísticas de Productos');
  const productosData = [
    ['CONCEPTO', 'CANTIDAD'],
    ['Total de productos', reportData.productos?.total || 0],
    ['Productos activos', reportData.productos?.activos || 0],
    ['Productos inactivos', reportData.productos?.inactivos || 0],
    ['Productos con stock', reportData.productos?.conStock || 0],
    ['Productos sin stock', reportData.productos?.sinStock || 0],
    ['Total de vendedores', reportData.productos?.vendedores || 0]
  ];
  
  const wsProductos = XLSX.utils.aoa_to_sheet([...productosHeader, ...productosData]);
  wsProductos['!cols'] = [{ wch: 35 }, { wch: 20 }];
  
  applyHeaderStyles(wsProductos, 2);
  applyTableHeaderStyles(wsProductos, 7, 2);
  applyDataRowStyles(wsProductos, 8, 7 + productosData.length - 1, 2);
  formatWorksheet(wsProductos, 2);
  
  XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos');
  
  // Hoja de Pedidos
  const pedidosHeader = createExcelHeader('Estadísticas de Pedidos');
  const pedidosData = [
    ['CONCEPTO', 'CANTIDAD'],
    ['Total de pedidos', reportData.pedidos?.total || 0],
    ['Pedidos pendientes', reportData.pedidos?.pendientes || 0],
    ['Pedidos en proceso', reportData.pedidos?.enProceso || 0],
    ['Pedidos entregados', reportData.pedidos?.entregados || 0],
    ['Pedidos cancelados', reportData.pedidos?.cancelados || 0],
    ['Total de compradores', reportData.pedidos?.compradores || 0]
  ];
  
  const wsPedidos = XLSX.utils.aoa_to_sheet([...pedidosHeader, ...pedidosData]);
  wsPedidos['!cols'] = [{ wch: 35 }, { wch: 20 }];
  
  applyHeaderStyles(wsPedidos, 2);
  applyTableHeaderStyles(wsPedidos, 7, 2);
  applyDataRowStyles(wsPedidos, 8, 7 + pedidosData.length - 1, 2);
  formatWorksheet(wsPedidos, 2);
  
  XLSX.utils.book_append_sheet(wb, wsPedidos, 'Pedidos');
  
  // Hoja de Ventas
  const ventasHeader = createExcelHeader('Estadísticas de Ventas');
  const ventasData = [
    ['CONCEPTO', 'VALOR'],
    ['Total de transacciones', reportData.ventas?.total || 0],
    ['Monto total de ventas', '$' + ((reportData.ventas?.montoTotal || 0).toLocaleString('es-CO'))],
    ['Promedio por venta', '$' + ((reportData.ventas?.promedio || 0).toLocaleString('es-CO'))],
    ['Ventas último mes', '$' + ((reportData.ventas?.ultimoMes || 0).toLocaleString('es-CO'))]
  ];
  
  const wsVentas = XLSX.utils.aoa_to_sheet([...ventasHeader, ...ventasData]);
  wsVentas['!cols'] = [{ wch: 35 }, { wch: 25 }];
  
  applyHeaderStyles(wsVentas, 2);
  applyTableHeaderStyles(wsVentas, 7, 2);
  applyDataRowStyles(wsVentas, 8, 7 + ventasData.length - 1, 2);
  formatWorksheet(wsVentas, 2);
  
  XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');
  
  const fileName = 'COMUCTIVA_Auditoria_' + new Date().toISOString().split('T')[0] + '.xlsx';
  XLSX.writeFile(wb, fileName);
  return fileName;
};

/**
 * Exporta un reporte individual a Excel con formato mejorado
 * @param {Array} reportData - Datos del reporte
 * @param {string} reportType - Tipo de reporte
 * @param {string} reportTitle - Título del reporte
 * @returns {string} Nombre del archivo generado
 */
export const exportSingleReportToExcel = (reportData, reportType, reportTitle) => {
  if (!Array.isArray(reportData) || reportData.length === 0) {
    throw new Error('No hay datos para exportar');
  }
  
  const header = createExcelHeader(reportTitle);
  
  // Convertir los datos según el tipo de reporte
  let formattedData = [];
  
  if (reportType === 'productos') {
    formattedData = reportData.map(p => ({
      'Nombre': p.nombre,
      'Valor': p.valor,
      'Cantidad': p.cantidad,
      'Categoria': p.categoria,
      'Descripcion': p.descripcion
    }));
  } else if (reportType === 'pedidos') {
    formattedData = reportData.map(p => ({
      'Fecha': p.fecha,
      'Valor': p.valor,
      'Estado': p.estado,
      'Direccion': p.direccion,
      'Metodo de Pago': p.metodoPago
    }));
  } else if (reportType === 'ventas') {
    formattedData = reportData.map(v => ({
      'Producto': v.producto,
      'Cantidad': v.cantidad,
      'Valor Unitario': v.valor,
      'Total': v.total,
      'Fecha': v.fecha,
      'Estado': v.estado
    }));
  } else if (reportType === 'compras') {
    formattedData = reportData.map(c => ({
      'Producto': c.producto,
      'Cantidad': c.cantidad,
      'Valor Unitario': c.valor,
      'Total': c.total,
      'Vendedor': c.vendedor,
      'Fecha': c.fecha,
      'Estado': c.estado
    }));
  } else {
    // Para cualquier otro tipo, usar los datos tal cual
    formattedData = reportData;
  }
  
  const footer = createExcelFooter();
  
  const ws = XLSX.utils.json_to_sheet(formattedData, { origin: 'A7' });
  XLSX.utils.sheet_add_aoa(ws, header, { origin: 'A1' });
  XLSX.utils.sheet_add_aoa(ws, footer, { origin: -1 });
  
  // Configurar ancho de columnas según el tipo de reporte
  let numCols = 0;
  if (reportType === 'productos') {
    ws['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 40 }];
    numCols = 5;
  } else if (reportType === 'pedidos') {
    ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 18 }];
    numCols = 5;
  } else if (reportType === 'ventas') {
    ws['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
    numCols = 6;
  } else if (reportType === 'compras') {
    ws['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 15 }];
    numCols = 7;
  } else {
    // Ancho por defecto para otros tipos
    numCols = Object.keys(formattedData[0] || {}).length;
    ws['!cols'] = Array(numCols).fill({ wch: 20 });
  }
  
  // Aplicar estilos
  applyHeaderStyles(ws, numCols);
  applyTableHeaderStyles(ws, 7, numCols);
  applyDataRowStyles(ws, 8, 7 + formattedData.length, numCols);
  applyFooterStyles(ws, 7 + formattedData.length + 2, numCols);
  formatWorksheet(ws, numCols);
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, reportTitle);
  
  const fileName = 'COMUCTIVA_Reporte_' + reportType + '_' + new Date().toISOString().split('T')[0] + '.xlsx';
  XLSX.writeFile(wb, fileName);
  return fileName;
};
