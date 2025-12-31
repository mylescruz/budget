import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const storeColumn = "col-6";
const spentColumn = "col-6 text-end";

const TopSpentStores = ({ stores }) => {
  if (stores.length === 0) {
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
          <Col className={storeColumn}>Store</Col>
          <Col className={spentColumn}>Total Amount</Col>
        </Row>
        {stores.map((store, index) => (
          <Row key={index} className="d-flex my-1">
            <Col className={storeColumn}>
              <span className="fw-bold">{index + 1}.</span>{" "}
              {store.store.length > 9
                ? store.store.slice(0, 9) + "..."
                : store.store}
            </Col>
            <Col className={spentColumn}>{dollarFormatter(store.amount)}</Col>
          </Row>
        ))}
      </Card.Body>
    );
  }
};

export default TopSpentStores;
