import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './QuienesSomos.css';

const QuienesSomos = () => {
  return (
    <div className="quienes-somos-page">
      <Container fluid className="hero-section">
        <Container>
          <div className="hero-content text-center">
            <h1 className="display-4 fw-bold">Quiénes Somos</h1>
            <p className="lead">
              Conectamos directamente a campesinos y consumidores, promoviendo productos sostenibles y fortaleciendo la economía local.
            </p>
          </div>
        </Container>
      </Container>

      <Container className="content-section">
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <div className="purpose-section text-center mb-5">
              <h2 className="section-title">Nuestro Propósito</h2>
              <p className="section-description">
                Impulsamos el desarrollo rural y comercio justo a través de una plataforma transparente.
              </p>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Row>
              <Col md={6} className="mb-4">
                <div className="vision-mision-section">
                  <h3 className="section-subtitle">Misión</h3>
                  <p className="section-text">
                    Facilitar un canal digital seguro que fortalezca la economía campesina 
                    mediante comercio directo y justo.
                  </p>
                </div>
              </Col>
              <Col md={6} className="mb-4">
                <div className="vision-mision-section">
                  <h3 className="section-subtitle">Visión</h3>
                  <p className="section-text">
                    Ser la plataforma líder en comercialización directa de productos 
                    campesinos, fomentando innovación y compromiso social.
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <div className="values-section text-center">
              <h2 className="section-title">Valores</h2>
              <div className="values-badges">
                <span className="value-badge">Transparencia</span>
                <span className="value-badge">Comercio Justo</span>
                <span className="value-badge">Sostenibilidad</span>
                <span className="value-badge">Inclusión</span>
                <span className="value-badge">Calidad</span>
                <span className="value-badge">Compromiso</span>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <div className="problem-section text-center">
              <h2 className="section-title">Problemática</h2>
              <p className="section-description">
                Los campesinos enfrentan barreras tecnológicas y dificultad para acceder a mercados justos.
              </p>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="justification-section text-center">
              <h2 className="section-title">Justificación</h2>
              <p className="section-description">
                Ofrecemos transparencia y equidad mediante un canal directo que mejora 
                ingresos y dignifica el trabajo campesino.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default QuienesSomos;