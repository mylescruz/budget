import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const TopSpentStores = ({ stores }) => {
  return (
    <Card.Body>
      <h4 className="text-center">Stores Shopped</h4>
      <Row className="fw-bold">
        <Col>Store</Col>
        <Col className="text-end">Total Amount</Col>
      </Row>
      {stores.map((store) => (
        <Row className="d-flex my-1">
          <Col>{store.store}</Col>
          <Col className="text-end">{dollarFormatter(store.amount)}</Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopSpentStores;
