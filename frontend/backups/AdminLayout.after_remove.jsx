// Backup of current AdminLayout before re-adding Usuarios and Pedidos links
import React from 'react';
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
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-auto p-0">
          <div style={sidebarStyle}>
            <nav>
              <Link to="/admin" style={linkStyle}>Resumen</Link>
              <Link to="/admin/productos" style={linkStyle}>Productos</Link>
              <Link to="/admin/categorias" style={linkStyle}>Categorías</Link>
              <Link to="/admin/promociones" style={linkStyle}>Promociones</Link>
              <Link to="/admin/moderacion" style={linkStyle}>Moderación</Link>
              <Link to="/admin/auditoria" style={linkStyle}>Auditoría</Link>
            </nav>
          </div>
        </div>

        <div className="col">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
