import React, { useEffect, useState } from 'react';
import { getComentariosAdmin, deleteComentarioAdmin, restoreComentarioAdmin } from '../services/api';
import { useToast } from '../components/ToastProvider';

const AdminModeracion = () => {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const toast = useToast();

  const loadComentarios = async () => {
    try {
      setLoading(true);
      const res = await getComentariosAdmin();
      setComentarios(res.data || []);
    } catch (err) {
      console.error(err);
      toast.add('Error al cargar comentarios', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComentarios();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este comentario? Esta acción puede desactivarlo.')) return;
    try {
      await deleteComentarioAdmin(id);
      toast.add('Comentario eliminado', 'success');
      loadComentarios();
    } catch (err) {
      console.error(err);
      toast.add('Error al eliminar comentario', 'danger');
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreComentarioAdmin(id);
      toast.add('Comentario restaurado', 'success');
      loadComentarios();
    } catch (err) {
      console.error(err);
      toast.add('Error al restaurar comentario', 'danger');
    }
  };

  return (
    <div className="container py-4">
      <h3>Panel de Moderación</h3>
      <p className="text-muted">Ver y moderar comentarios de usuarios.</p>

      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Producto</th>
                <th>Comentario</th>
                <th>Calif.</th>
                <th>Fecha</th>
                <th>Imagen</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comentarios.map((item) => {
                const dto = item.comentario;
                return (
                  <tr key={dto.id}>
                    <td>{dto.id}</td>
                    <td>{dto.usuarioNombre} <br/> <small>{dto.usuarioDocumento}</small></td>
                    <td>{dto.productoNombre} <br/> <small>ID:{dto.productoId}</small></td>
                    <td style={{maxWidth:300}}>{dto.comentario}</td>
                    <td>{dto.calificacion}</td>
                    <td>{dto.fecha ? new Date(dto.fecha).toLocaleString() : ''}</td>
                    <td>
                      {item.productoImagenUrl ? (
                        <img src={item.productoImagenUrl} alt="img" style={{width:60, height:60, objectFit:'cover', cursor:'pointer'}} onClick={() => setPreviewUrl(item.productoImagenUrl)} />
                      ) : ('-')}
                    </td>
                    <td>{item.activo ? 'Activo' : 'Inactivo'}</td>
                    <td>
                      {item.activo ? (
                        <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(dto.id)}>Eliminar</button>
                      ) : (
                        <button className="btn btn-sm btn-success me-2" onClick={() => handleRestore(dto.id)}>Restaurar</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview modal simple */}
      {previewUrl && (
        <div className="modal show d-block" tabIndex={-1} role="dialog" onClick={() => setPreviewUrl(null)}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Vista de imagen</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setPreviewUrl(null)}></button>
              </div>
              <div className="modal-body text-center">
                <img src={previewUrl} alt="preview" style={{maxWidth:'100%', maxHeight:'70vh'}} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeracion;
