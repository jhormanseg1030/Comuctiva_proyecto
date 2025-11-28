import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getUsuario, updateUsuario, cambiarPassword } from '../services/api';

const MyAccount = () => {
  const { user, logout, token } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await getUsuario(user.numeroDocumento);
      const userData = response.data;
      setFormData({
        nombre: userData.nombre || '',
        email: userData.email || '',
        telefono: userData.telefono || '',
        direccion: userData.direccion || ''
      });
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos del usuario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      await updateUsuario(user.numeroDocumento, formData);
      
      setSuccess(true);
      alert('Información actualizada exitosamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la información');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setChangingPassword(true);

      await cambiarPassword(user.numeroDocumento, {
        passwordActual: passwordData.currentPassword,
        passwordNueva: passwordData.newPassword
      });

      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Contraseña actualizada exitosamente');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>Cargando información...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Mi Cuenta</h1>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body className="p-4">
              <h5 className="mb-4">Información Personal</h5>
              
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
                  Información actualizada exitosamente
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Número de Documento</Form.Label>
              <Form.Control
                type="text"
                value={user.numeroDocumento}
                disabled
              />
              <Form.Text className="text-muted">
                El número de documento no se puede modificar
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline-danger"
                    onClick={() => {
                      if (confirm('¿Estás seguro de cerrar sesión?')) {
                        logout();
                      }
                    }}
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body className="p-4">
              <h5 className="mb-4">Cambiar Contraseña</h5>
              
              {passwordError && (
                <Alert variant="danger" dismissible onClose={() => setPasswordError(null)}>
                  {passwordError}
                </Alert>
              )}
              
              {passwordSuccess && (
                <Alert variant="success" dismissible onClose={() => setPasswordSuccess(false)}>
                  Contraseña actualizada exitosamente
                </Alert>
              )}

              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña Actual</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Ingresa tu contraseña actual"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Repite la nueva contraseña"
                  />
                </Form.Group>

                <Button type="submit" variant="warning" className="w-100" disabled={changingPassword}>
                  {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MyAccount;
