import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const categoryColumn = "col-8 col-md-3";
const budgetColumn = "d-none d-md-block col-md-3 text-end";
const spentColumn = "d-none d-md-block col-md-3 text-end";
const leftColumn = "col-4 col-md-3 text-end";

const TopOverSpendingCategories = ({ categories }) => {
  if (categories.length === 0) {
    return (
      <Card.Body>
        <Row className="fw-bold text-center">
          Congrats! You didn't overspend on any category this year!
        </Row>
      </Card.Body>
    );
  }
  return (
    <Card.Body>
      <Row className="fw-bold">
        <Col className={categoryColumn}>Category</Col>
        <Col className={budgetColumn}>Total Budget</Col>
        <Col className={spentColumn}>Total Spent</Col>
        <Col className={leftColumn}>Total Left</Col>
      </Row>
      {categories.map((category, index) => (
        <Row key={index} className="d-flex my-1">
          <Col className={categoryColumn}>
            <span className="fw-bold">{index + 1}.</span> {category.name}
          </Col>
          <Col className={budgetColumn}>{dollarFormatter(category.budget)}</Col>
          <Col className={spentColumn}>{dollarFormatter(category.actual)}</Col>
          <Col className={leftColumn}>
            <span className={category.remaining < 0 && "fw-bold text-danger"}>
              {dollarFormatter(category.remaining)}
            </span>
          </Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopOverSpendingCategories;
