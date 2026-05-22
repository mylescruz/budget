import dollarFormatter from "@/helpers/dollarFormatter";
import { Modal } from "react-bootstrap";

const MonthTotalsModal = ({ monthData, modalDetails, topic, setTopic }) => {
  const closeMonthModal = () => {
    setTopic(null);
  };

  return (
    <Modal show={topic} size={"sm"} onHide={closeMonthModal} centered>
      <Modal.Header
        className="d-flex align-items-center justify-content-center"
        closeButton
      >
        <Modal.Title className="fs-5">{modalDetails.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center text-muted small mt-0 mb-2">
          {modalDetails.description}
        </p>
        {monthData.map((month, index) => (
          <div key={index} className="border-bottom py-1">
            <p className="text-muted mb-0">{month.name}</p>
            <h5
              className={`fw-bold ${month.amount < 0 ? "text-danger" : "text-dark"}`}
            >
              {dollarFormatter(Math.abs(month.amount))}
            </h5>
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default MonthTotalsModal;
