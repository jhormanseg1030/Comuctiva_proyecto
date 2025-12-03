import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const add = (message, variant = 'info', delay = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, variant, delay }]);
  };

  const remove = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(t => (
          <Toast key={t.id} bg={t.variant} onClose={() => remove(t.id)} delay={t.delay} autohide>
            <Toast.Body className={t.variant === 'dark' ? 'text-white' : ''}>{t.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
