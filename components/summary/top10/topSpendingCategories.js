import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const TopSpendingCategories = ({ categories }) => {
  return (
    <Card.Body>
      <h4 className="text-center">Spending Categories</h4>
      <Row className="fw-bold">
        <Col>Category</Col>
        <Col className="text-end">Total Spent</Col>
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

export default TopSpendingCategories;
