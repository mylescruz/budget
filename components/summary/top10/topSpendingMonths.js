import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const monthColumn = "col-6 col-md-4";
const spentColumn = "col-6 col-md-4 text-end";
const budgetColumn = "d-none d-md-block col-md-4 text-end";

const TopSpendingMonths = ({ months }) => {
  return (
    <Card.Body>
      <h4 className="text-center">Spending Months</h4>
      <Row className="fw-bold">
        <Col className={monthColumn}>Month</Col>
        <Col className={spentColumn}>Total Spent</Col>
        <Col className={budgetColumn}>Total Budget</Col>
      </Row>
      {months.map((month, index) => (
        <Row key={index} className="d-flex my-1">
          <Col className={monthColumn}>
            <span className="fw-bold">{index + 1}.</span> {month.name}
          </Col>
          <Col className={spentColumn}>{dollarFormatter(month.spent)}</Col>
          <Col className={budgetColumn}>{dollarFormatter(month.budget)}</Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopSpendingMonths;
