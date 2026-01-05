import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const monthColumn = "col-6";
const spentColumn = "col-6 text-end";

const TopMonthsCard = ({ insight }) => {
  if (insight.months.length === 0) {
    return (
      <Card.Body>
        <h4 className="text-center">{insight.title}</h4>
        <Row className="fw-bold text-center">
          You didn't spend any money this year!
        </Row>
      </Card.Body>
    );
  } else {
    return (
      <Card.Body>
        <h4 className="fw-bold text-center">{insight.title}</h4>
        <Row className="fw-bold">
          <Col className={monthColumn}>Month</Col>
          <Col className={spentColumn}>
            Total <span>{insight.negative ? "Overspent" : "Spent"}</span>
          </Col>
        </Row>
        {insight.months.map((month, index) => (
          <Row key={index} className="d-flex my-1">
            <Col className={monthColumn}>
              <span className="fw-bold">{index + 1}.</span> {month.name}
            </Col>
            <Col className={spentColumn}>
              <span className={insight.negative ? "fw-bold text-danger" : ""}>
                {dollarFormatter(month.actual)}
              </span>
            </Col>
          </Row>
        ))}
      </Card.Body>
    );
  }
};

export default TopMonthsCard;
