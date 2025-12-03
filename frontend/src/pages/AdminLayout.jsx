import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

const sidebarStyle = {
  width: '200px',
  borderRight: '1px solid #e5e5e5',
  minHeight: '80vh',
  paddingTop: '20px'
};

const linkStyle = {
  display: 'block',
  padding: '12px 16px',
  color: '#333',
  textDecoration: 'none'
};

const AdminLayout = () => {
  const [showAuditoriaModal, setShowAuditoriaModal] = useState(false);
  const openAuditoriaModal = (e) => {
    e.preventDefault();
    setShowAuditoriaModal(true);
  };
  const closeAuditoriaModal = () => setShowAuditoriaModal(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');

  const startReport = () => setShowReportForm(true);
  const cancelReport = () => {
    setShowReportForm(false);
    setReportTitle('');
    setReportContent('');
  };

  const saveReportAsFile = () => {
    const filename = (reportTitle || 'reporte-auditoria') + '.txt';
    const blob = new Blob([`Título: ${reportTitle}\n\n${reportContent}`], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    cancelReport();
  };
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-auto p-0">
          <div style={sidebarStyle}>
            <nav>
              <Link to="/admin" style={linkStyle}>Resumen</Link>
              <Link to="/admin/usuarios" style={linkStyle}>Usuarios</Link>
              <Link to="/admin/pedidos" style={linkStyle}>Pedidos</Link>
              <Link to="/admin/productos" style={linkStyle}>Productos</Link>
              <Link to="/admin/categorias" style={linkStyle}>Categorías</Link>
              <Link to="/admin/papelera" style={linkStyle}>Papelera</Link>
              <Link to="/admin/moderacion" style={linkStyle}>Moderación</Link>
              <a href="/admin/auditoria" onClick={openAuditoriaModal} style={linkStyle}>Auditoría</a>
            </nav>
          </div>
        </div>

        <div className="col">
          <Outlet />
          {showAuditoriaModal && (
            <div onClick={closeAuditoriaModal} style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div onClick={(ev) => ev.stopPropagation()} style={{width: '90%', maxWidth: '1100px', height: '90%', background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #eee'}}>
                  <strong>Auditoría</strong>
                  <button onClick={closeAuditoriaModal} style={{background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer'}}>✕</button>
                </div>

                <div style={{padding: 20, height: 'calc(100% - 56px)', overflow: 'auto'}}>
                  {!showReportForm ? (
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12}}>
                      <p>Espacio de auditoría — aquí puedes crear un reporte cuando lo necesites.</p>
                      <button onClick={startReport} className="btn btn-primary">Crear reporte</button>
                    </div>
                  ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                      <label style={{fontWeight: 600}}>Título</label>
                      <input className="form-control" value={reportTitle} onChange={(e)=>setReportTitle(e.target.value)} placeholder="Título del reporte" />

                      <label style={{fontWeight: 600}}>Contenido</label>
                      <textarea className="form-control" value={reportContent} onChange={(e)=>setReportContent(e.target.value)} rows={10} placeholder="Escribe aquí el reporte..." />

                      <div style={{display: 'flex', gap: 8}}>
                        <button onClick={saveReportAsFile} className="btn btn-success">Guardar y descargar</button>
                        <button onClick={cancelReport} className="btn btn-secondary">Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
