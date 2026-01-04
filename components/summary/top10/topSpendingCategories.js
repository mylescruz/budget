import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const categoryColumn = "col-6";
const spentColumn = "col-6 text-end";

const TopSpendingCategories = ({ categories }) => {
  const spendingCategoriesDescending = categories
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 3);

  if (spendingCategoriesDescending.length === 0) {
    return (
      <Card.Body>
        <Row className="fw-bold text-center">
          You somehow didn't buy anything this year! That's incredible!
        </Row>
      </Card.Body>
    );
  } else {
    return (
      <Card.Body>
        <Row className="fw-bold">
          <Col className={categoryColumn}>Category</Col>
          <Col className={spentColumn}>Total Spent</Col>
        </Row>
        {spendingCategoriesDescending.map((category, index) => (
          <Row key={index} className="d-flex my-1">
            <Col className={categoryColumn}>
              <span className="fw-bold">{index + 1}.</span>{" "}
              {category.name.length > 9
                ? category.name.slice(0, 9) + "..."
                : category.name}
            </Col>
            <Col className={spentColumn}>
              {dollarFormatter(category.actual)}
            </Col>
          </Row>
        ))}
      </Card.Body>
    );
  }
};

export default TopSpendingCategories;
