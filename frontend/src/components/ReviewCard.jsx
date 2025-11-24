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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <ListGroup.Item>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 className="mb-1">{comentario.usuario?.nombre || 'Usuario'}</h6>
          <div className="star-rating">
            {renderStars(comentario.calificacion)}
          </div>
        </div>
        <small className="text-muted">
          {formatDate(comentario.fechaComentario)}
        </small>
      </div>
      <p className="mb-0">{comentario.contenido}</p>
    </ListGroup.Item>
  );
};

export default ReviewCard;
