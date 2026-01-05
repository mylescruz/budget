import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const storeColumn = "col-6";
const amountColumn = "col-6 text-end";

const TopTransactionsCard = ({ insight }) => {
  if (insight.transactions.length === 0) {
    return (
      <Card.Body>
        <h4 className="text-center">{insight.title}</h4>
        <Row className="fw-bold text-center">
          You somehow didn't buy anything this year! That's incredible!
        </Row>
      </Card.Body>
    );
  } else {
    return (
      <Card.Body>
        <h4 className="fw-bold text-center">{insight.title}</h4>
        <Row className="fw-bold">
          <Col className={storeColumn}>Store</Col>
          <Col className={amountColumn}>Amount</Col>
        </Row>
        {insight.transactions.map((transaction, index) => (
          <Row key={index} className="d-flex my-1">
            <Col className={storeColumn}>
              <span className="fw-bold">{index + 1}.</span>{" "}
              {transaction.store.length > 15
                ? transaction.store.slice(0, 15) + "..."
                : transaction.store}
            </Col>
            <Col className={amountColumn}>
              {insight.value === "number"
                ? transaction.amount
                : dollarFormatter(transaction.amount)}
            </Col>
          </Row>
        ))}
      </Card.Body>
    );
  }
};

export default TopTransactionsCard;
