import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const ReviewCard = ({ comentario }) => {
  const renderStars = (calificacion) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= calificacion ? 'text-warning' : 'text-muted'}>
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
    <ListGroup.Item>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 className="mb-1">{authorName}</h6>
          <div className="star-rating">
            {renderStars(comentario.calificacion)}
          </div>
        </div>
        <small className="text-muted">
          {formatDate(dateValue)}
        </small>
      </div>
      <p className="mb-0">{content}</p>
    </ListGroup.Item>
  );
};

export default ReviewCard;
