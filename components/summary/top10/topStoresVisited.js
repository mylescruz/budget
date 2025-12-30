import { Card, Col, Row } from "react-bootstrap";

const TopStoresVisted = ({ stores }) => {
  return (
    <Card.Body>
      <h4 className="text-center">Stores Visited</h4>
      <Row className="fw-bold">
        <Col>Store</Col>
        <Col className="text-end">Visits</Col>
      </Row>
      {stores.map((store, index) => (
        <Row key={index} className="d-flex my-1">
          <Col>
            <span className="fw-bold">{index + 1}.</span> {store.store}
          </Col>
          <Col className="text-end">{store.visits}</Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopStoresVisted;
