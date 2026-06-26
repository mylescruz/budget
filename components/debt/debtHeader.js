import { Button, Col, Row } from "react-bootstrap";

const DebtHeader = () => {
  return (
    <Row className="align-items-center mb-4">
      <Col>
        <h2 className="mb-0">Debt Overview</h2>
      </Col>

      {/* <Col xs="auto">
        <Button>
          <i className="bi bi-plus-lg me-2" />
          Add Debt
        </Button>
      </Col> */}
    </Row>
  );
};

export default DebtHeader;
