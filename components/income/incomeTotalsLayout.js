import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const cardColumn = "col-12 col-md-6 col-xl-3";

const IncomeTotalsLayout = ({ incomeTotals }) => {
  return (
    <Row className="text-center col-12 col-xl-10 my-2 mx-auto d-flex justify-content-center">
      <Col className={cardColumn}>
        <Card className="my-2 card-background">
          <Card.Body>
            <h6 className="fw-bold">Total Gross</h6>
            <h4>{dollarFormatter(incomeTotals.gross)}</h4>
          </Card.Body>
        </Card>
      </Col>
      <Col className={cardColumn}>
        <Card className="my-2 card-background">
          <Card.Body>
            <h6 className="fw-bold">Total Net</h6>
            <h4>{dollarFormatter(incomeTotals.amount)}</h4>
          </Card.Body>
        </Card>
      </Col>
      <Col className={cardColumn}>
        <Card className="my-2 card-background">
          <Card.Body>
            <h6 className="fw-bold">Total Deductions</h6>
            <h4>{dollarFormatter(incomeTotals.deductions)}</h4>
          </Card.Body>
        </Card>
      </Col>
      <Col className={cardColumn}>
        <Card className="my-2 card-background">
          <Card.Body>
            <h6 className="fw-bold"># of Sources</h6>
            <h4>{incomeTotals.numSources}</h4>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default IncomeTotalsLayout;
