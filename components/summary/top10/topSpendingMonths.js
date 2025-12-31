import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const monthColumn = "col-6";
const spentColumn = "col-6 text-end";

const TopSpendingMonths = ({ months }) => {
  return (
    <Card.Body>
      <Row className="fw-bold">
        <Col className={monthColumn}>Month</Col>
        <Col className={spentColumn}>Total Spent</Col>
      </Row>
      {months.map((month, index) => (
        <Row key={index} className="d-flex my-1">
          <Col className={monthColumn}>
            <span className="fw-bold">{index + 1}.</span> {month.name}
          </Col>
          <Col className={spentColumn}>{dollarFormatter(month.spent)}</Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopSpendingMonths;
