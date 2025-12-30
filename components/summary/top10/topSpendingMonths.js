import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const TopSpendingMonths = ({ months }) => {
  return (
    <Card.Body>
      <h4 className="text-center">Spending Months</h4>
      <Row className="fw-bold">
        <Col>Month</Col>
        <Col className="text-end">Total Spent</Col>
      </Row>
      {months.map((month, index) => (
        <Row key={index} className="d-flex my-1">
          <Col>
            <span className="fw-bold">{index + 1}.</span> {month.name}
          </Col>
          <Col className="text-end">{dollarFormatter(month.spent)}</Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopSpendingMonths;
