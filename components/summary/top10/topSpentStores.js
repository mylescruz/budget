import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const TopSpentStores = ({ stores }) => {
  return (
    <Card.Body>
      <Row className="fw-bold">
        <Col>Store</Col>
        <Col className="text-end">Total Amount</Col>
      </Row>
      {stores.map((store, index) => (
        <Row key={index} className="d-flex my-1">
          <Col>
            <span className="fw-bold">{index + 1}.</span> {store.store}
          </Col>
          <Col className="text-end">{dollarFormatter(store.amount)}</Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopSpentStores;
