import React from 'react';
import { ListGroup } from 'react-bootstrap';

const CategoryFilter = ({ categorias, selectedCategoria, onSelectCategoria }) => {
  return (
    <div className="mb-4">
      <h5 className="mb-3">Categorías</h5>
      <ListGroup>
        <ListGroup.Item 
          action
          active={selectedCategoria === null}
          onClick={() => onSelectCategoria(null)}
          className="category-filter"
        >
          Todas las Categorías
        </ListGroup.Item>
        {categorias.map((categoria) => (
          <ListGroup.Item
            key={categoria.id}
            action
            active={selectedCategoria === categoria.id}
            onClick={() => onSelectCategoria(categoria.id)}
            className="category-filter"
          >
            {categoria.nombre}
            {categoria.subcategorias && categoria.subcategorias.length > 0 && (
              <small className="text-muted ms-2">
                ({categoria.subcategorias.length})
              </small>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default CategoryFilter;
