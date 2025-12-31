import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const categoryColumn = "col-6";
const spentColumn = "col-6 text-end";

const TopFixedCategories = ({ categories }) => {
  if (categories.length === 0) {
    return (
      <Card.Body>
        <Row className="fw-bold text-center">
          You didn't have any fixed categories this year!
        </Row>
      </Card.Body>
    );
  } else {
    return (
      <Card.Body>
        <Row className="fw-bold">
          <Col className={categoryColumn}>Category</Col>
          <Col className={spentColumn}>Total Amount</Col>
        </Row>
        {categories.map((category, index) => (
          <Row key={index} className="d-flex my-1">
            <Col className={categoryColumn}>
              <span className="fw-bold">{index + 1}.</span>{" "}
              {category.name.length > 9
                ? category.name.slice(0, 9) + "..."
                : category.name}
            </Col>
            <Col className={spentColumn}>
              {dollarFormatter(category.amount)}
            </Col>
          </Row>
        ))}
      </Card.Body>
    );
  }
};

export default TopFixedCategories;
