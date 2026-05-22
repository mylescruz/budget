import dollarFormatter from "@/helpers/dollarFormatter";
import { Col, Modal } from "react-bootstrap";

const MonthTotalsModal = ({ monthData, modalDetails, topic, setTopic }) => {
  const closeMonthModal = () => {
    setTopic(null);
  };

  return (
    <Modal show={topic !== null} onHide={closeMonthModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{modalDetails.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center text-muted small m-0">
          {modalDetails.description}
        </p>
        <div className="d-flex flex-column">
          {monthData.map((month, index) => (
            <div key={index} className="my-1 d-flex flex-row">
              <Col xs={6}>{month.name}</Col>
              <Col
                xs={6}
                className={`text-end ${month.amount < 0 ? "text-danger fw-semibold" : "text-dark"}`}
              >
                {dollarFormatter(Math.abs(month.amount))}
              </Col>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default MonthTotalsModal;
