import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Badge, Card, Col, Dropdown, ProgressBar, Row } from "react-bootstrap";

const DebtCard = ({ debt }) => {
  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between mb-3">
          <div>
            <h5 className="mb-1">{debt.name}</h5>

            <Badge bg={debt.type === "loan" ? "primary" : "success"}>
              {debt.type === "loan" ? "Personal Loan" : "Credit Card"}
            </Badge>
          </div>

          <Dropdown>
            <Dropdown.Toggle variant="light" size="sm">
              <i className="bi bi-three-dots-vertical" />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item>Edit</Dropdown.Item>
              <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Row className="g-3 mb-3">
          <Col xs={6}>
            <small className="text-muted">Balance</small>
            <div className="fw-bold">
              {dollarFormatter(debt.currentBalance)}
            </div>
          </Col>

          <Col xs={6}>
            <small className="text-muted">APR</small>
            <div className="fw-bold">{debt.apr}%</div>
          </Col>

          <Col xs={6}>
            <small className="text-muted">Minimum Payment</small>
            <div className="fw-bold">
              {dollarFormatter(debt.minimumPayment)}
            </div>
          </Col>

          <Col xs={6}>
            <small className="text-muted">Payoff Goal</small>
            <div className="fw-bold">
              {dateFormatter(debt.targetPayoffDate)}
            </div>
          </Col>
        </Row>

        <ProgressBar now={40} />
      </Card.Body>
    </Card>
  );
};

export default DebtCard;
