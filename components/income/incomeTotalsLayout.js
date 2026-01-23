import dollarFormatter from "@/helpers/dollarFormatter";
import { useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import IncomeTotalsModal from "./incomeTotalsModal";

const cardColumn = "col-12 col-md-6 col-lg-4 mb-2";

const IncomeTotalsLayout = ({ incomeTotals }) => {
  const [totalsModal, setTotalsModal] = useState(false);

  const showModal = () => {
    setTotalsModal(true);
  };

  return (
    <Row className="text-center w-full my-2 mx-auto d-flex justify-content-center">
      <Col className={cardColumn}>
        <Card className="my-2 bg-dark text-white">
          <Card.Body>
            <h4 className="fw-bold">Total Income</h4>
            <h5>{dollarFormatter(incomeTotals.amount)}</h5>
            {incomeTotals.amount !== 0 && (
              <p
                className="text-center text-decoration-underline clicker m-0"
                onClick={showModal}
              >
                Details
              </p>
            )}
          </Card.Body>
        </Card>
      </Col>

      <IncomeTotalsModal
        incomeTotals={incomeTotals}
        totalsModal={totalsModal}
        setTotalsModal={setTotalsModal}
      />
    </Row>
  );
};

export default IncomeTotalsLayout;
