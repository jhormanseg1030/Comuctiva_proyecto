import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const ReviewCard = ({ comentario }) => {
  const renderStars = (calificacion) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          style={{ 
            color: i <= calificacion ? '#FFA41C' : '#dee2e6',
            fontSize: '1.1rem',
            marginRight: '2px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const parseDate = (value) => {
    // Accept multiple shapes: ISO string, timestamp, or an object with year/month/day
    if (!value) return null;
    // If already a Date
    if (value instanceof Date) return value;
    // If it's a number (timestamp)
    if (typeof value === 'number') return new Date(value);
    // If it's an object like { year, month, day, hour, minute, second }
    if (typeof value === 'object' && value.year) {
      const y = value.year;
      const m = (value.month || 1) - 1;
      const d = value.day || 1;
      const h = value.hour || 0;
      const min = value.minute || 0;
      const s = value.second || 0;
      return new Date(y, m, d, h, min, s);
    }
    // Fallback: try Date constructor with string
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDate = (value) => {
    const date = parseDate(value);
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Author name: tolerate both DTO plain fields and nested usuario object
  const authorName = comentario.usuarioNombre || (comentario.usuario && (comentario.usuario.nombre || comentario.usuario.nombreCompleto)) || 'Usuario';

  // Date: DTO uses 'fecha' while entity used 'fechaComentario'
  const dateValue = comentario.fecha || comentario.fechaComentario || comentario.fechaComentario;

  // Content: comentario.contenido or comentario.comentario (in case of DTO mismatch)
  const content = comentario.contenido || comentario.comentario || '';

  return (
    <div style={{ padding: '20px 0' }}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div style={{ flex: 1 }}>
          <div className="d-flex align-items-center mb-2">
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#232F3E',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '1rem',
                marginRight: '12px'
              }}
            >
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h6 style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                fontWeight: '700',
                color: '#0f1111'
              }}>
                {authorName}
              </h6>
            </div>
          </div>
          <div className="d-flex align-items-center mb-2">
            <div className="star-rating me-2">
              {renderStars(comentario.calificacion)}
            </div>
            <span style={{ 
              fontSize: '0.85rem', 
              color: '#565959',
              fontWeight: '700'
            }}>
              {comentario.calificacion === 5 ? 'Excelente' : 
               comentario.calificacion === 4 ? 'Muy bueno' :
               comentario.calificacion === 3 ? 'Bueno' :
               comentario.calificacion === 2 ? 'Regular' : 'Malo'}
            </span>
          </div>
        </div>
        <small style={{ 
          color: '#565959', 
          fontSize: '0.85rem',
          whiteSpace: 'nowrap',
          marginLeft: '15px'
        }}>
          {formatDate(dateValue)}
        </small>
      </div>
      <p style={{ 
        margin: 0, 
        fontSize: '0.95rem', 
        lineHeight: '1.5',
        color: '#0f1111'
      }}>
        {content}
      </p>
    </div>
  );
};

export default ReviewCard;
