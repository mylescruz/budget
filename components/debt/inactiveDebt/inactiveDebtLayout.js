import { Accordion, Col, Row } from "react-bootstrap";
import InactiveDebtCard from "./inactiveDebtCard";

const InactiveDebtLayout = ({ inactiveDebts }) => {
  return (
    <Accordion className="mt-4 shadow-sm">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className="d-flex justify-content-between align-items-center w-100 me-3">
            <span className="fw-bold">
              🎉 Paid Off Debts ({inactiveDebts.length})
            </span>
          </div>
        </Accordion.Header>

        <Accordion.Body>
          <Row className="g-3">
            {inactiveDebts.map((debt) => (
              <Col key={debt._id} xs={12}>
                <InactiveDebtCard debt={debt} />
              </Col>
            ))}
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default InactiveDebtLayout;
