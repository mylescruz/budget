import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const categoryColumn = "col-6";
const leftColumn = "col-6 text-end";

const TopOverSpendingCategories = ({ categories }) => {
  const spendingCategoriesDescending = categories
    .filter((category) => category.remaining < 0)
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 3);

  if (spendingCategoriesDescending.length === 0) {
    return (
      <Card.Body>
        <Row className="fw-bold text-center">
          Congrats! You didn't overspend on any category this year!
        </Row>
      </Card.Body>
    );
  } else {
    return (
      <Card.Body>
        <Row className="fw-bold">
          <Col className={categoryColumn}>Category</Col>
          <Col className={leftColumn}>Total Left</Col>
        </Row>
        {spendingCategoriesDescending.map((category, index) => (
          <Row key={index} className="d-flex my-1">
            <Col className={categoryColumn}>
              <span className="fw-bold">{index + 1}.</span>{" "}
              {category.name.length > 9
                ? category.name.slice(0, 9) + "..."
                : category.name}
            </Col>
            <Col className={leftColumn}>
              <span className="fw-bold text-danger">
                {dollarFormatter(category.remaining)}
              </span>
            </Col>
          </Row>
        ))}
      </Card.Body>
    );
  }
};

export default TopOverSpendingCategories;
