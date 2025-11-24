import React from 'react';
import { Card, Button } from 'react-bootstrap';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [loading, setLoading] = React.useState(false);

  const handleUpdateQuantity = async (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.stockDisponible) {
      alert(`Solo hay ${item.stockDisponible} unidades disponibles`);
      return;
    }

    setLoading(true);
    const result = await onUpdateQuantity(item.id, newQuantity);
    setLoading(false);

    if (!result.success) {
      alert(result.error);
    }
  };

  const handleRemove = async () => {
    if (!confirm('¿Estás seguro de eliminar este producto del carrito?')) return;

    setLoading(true);
    const result = await onRemove(item.id);
    setLoading(false);

    if (!result.success) {
      alert(result.error);
    }
  };

  const subtotal = item.productoPrecio * item.cantidad;

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="row align-items-center">
          <div className="col-md-2">
            <img 
              src={item.productoImagenUrl || 'https://via.placeholder.com/100'} 
              alt={item.productoNombre}
              className="img-fluid rounded"
            />
          </div>
          <div className="col-md-4">
            <h6>{item.productoNombre}</h6>
            <small className="text-muted">{item.productoDescripcion}</small>
          </div>
          <div className="col-md-2">
            <p className="mb-0 fw-bold">${item.productoPrecio.toFixed(2)}</p>
          </div>
          <div className="col-md-2">
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => handleUpdateQuantity(item.cantidad - 1)}
                disabled={loading || item.cantidad <= 1}
              >
                -
              </Button>
              <span className="mx-3">{item.cantidad}</span>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => handleUpdateQuantity(item.cantidad + 1)}
                disabled={loading || item.cantidad >= item.stockDisponible}
              >
                +
              </Button>
            </div>
            <small className="text-muted d-block mt-1">
              Stock: {item.stockDisponible}
            </small>
          </div>
          <div className="col-md-2 text-end">
            <h6 className="mb-2">${subtotal.toFixed(2)}</h6>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={handleRemove}
              disabled={loading}
            >
              🗑️ Eliminar
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CartItem;
