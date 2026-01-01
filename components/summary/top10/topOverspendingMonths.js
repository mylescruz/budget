import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const monthColumn = "col-6";
const spentColumn = "col-6 text-end";

const TopOverspendingMonths = ({ months }) => {
  const spendingMonthsAscending = months
    .filter((month) => month.remaining < 0)
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 3);

  if (spendingMonthsAscending.length === 0) {
    return (
      <Card.Body>
        <Row className="fw-bold text-center">
          You didn't overspend during any month this year!
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
        {spendingMonthsAscending.map((month, index) => (
          <Row key={index} className="d-flex my-1">
            <Col className={monthColumn}>
              <span className="fw-bold">{index + 1}.</span> {month.name}
            </Col>
            <Col className={spentColumn}>
              <span className="fw-bold text-danger">
                {dollarFormatter(month.remaining)}
              </span>
            </Col>
          </Row>
        ))}
      </Card.Body>
    );
  }
};

export default TopOverspendingMonths;
