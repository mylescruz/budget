import { Col, Container, Row } from "react-bootstrap";

const DebtLayout = () => {
  return (
    <Container>
      <Row className="d-flex justify-content-center">
        <Col xs={12} xl={10}>
          <div className="text-center">
            <h1 className="p-0 m-0 fw-bold">Debt</h1>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DebtLayout;
