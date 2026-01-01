import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const monthColumn = "col-6";
const spentColumn = "col-6 text-end";

const LowestSpendingMonths = ({ months }) => {
  const spendingMonthsDescending = months
    .sort((a, b) => a.actual - b.actual)
    .slice(0, 3);

  if (months.length === 0) {
    return (
      <Card.Body>
        <Row className="fw-bold text-center">
          You didn't spend any money this year!
        </Row>
      </Card.Body>
    );
  } else {
    return (
      <Card.Body>
        <Row className="fw-bold">
          <Col className={monthColumn}>Month</Col>
          <Col className={spentColumn}>Total Spent</Col>
        </Row>
        {spendingMonthsDescending.map((month, index) => (
          <Row key={index} className="d-flex my-1">
            <Col className={monthColumn}>
              <span className="fw-bold">{index + 1}.</span> {month.name}
            </Col>
            <Col className={spentColumn}>{dollarFormatter(month.actual)}</Col>
          </Row>
        ))}
      </Card.Body>
    );
  }
};

export default LowestSpendingMonths;
