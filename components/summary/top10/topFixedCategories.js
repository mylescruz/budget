import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const TopFixedCategories = ({ categories }) => {
  return (
    <Card.Body>
      <Row className="fw-bold">
        <Col>Fixed Category</Col>
        <Col className="text-end">Total Amount</Col>
      </Row>
      {categories.map((category, index) => (
        <Row key={index} className="d-flex my-1">
          <Col>
            <span className="fw-bold">{index + 1}.</span> {category.name}
          </Col>
          <Col className="text-end">{dollarFormatter(category.amount)}</Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopFixedCategories;
