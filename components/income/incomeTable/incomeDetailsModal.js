import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Button, Modal, Row } from "react-bootstrap";

const IncomeDetailsModal = ({ source, showModal, setShowModal }) => {
  const closeDetailsModal = () => {
    setShowModal("none");
  };

  const openEditModal = () => {
    setShowModal("edit");
  };

  const openDeleteModal = () => {
    setShowModal("delete");
  };

  return (
    <Modal show={showModal === "details"} onHide={closeDetailsModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{source.type} Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="m-2">Date: {dateFormatter(source.date)}</Row>
        {source.type === "Paycheck" && (
          <>
            <Row className="m-2">Company: {source.name}</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Gross Income: {dollarFormatter(source.gross)}
            </Row>
            <Row className="m-2">
              Deductions: {dollarFormatter(source.deductions)}
            </Row>
            <Row className="m-2">
              Net Income: {dollarFormatter(source.amount)}
            </Row>
          </>
        )}
        {source.type === "Sale" && (
          <>
            <Row className="m-2">Item Sold: {source.name}</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Sale Amount: {dollarFormatter(source.amount)}
            </Row>
          </>
        )}
        {source.type === "Gift" && (
          <>
            <Row className="m-2">Received Gift From: {source.name}</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Gift Amount: {dollarFormatter(source.amount)}
            </Row>
          </>
        )}
        {source.type === "Unemployment" && (
          <>
            <Row className="m-2">Received Unemployment from EDD</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Payout Amount: {dollarFormatter(source.amount)}
            </Row>
          </>
        )}
        {source.type === "Loan" && (
          <>
            <Row className="m-2">Loan Servicer: {source.name}</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Loan Amount: {dollarFormatter(source.amount)}
            </Row>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="danger" onClick={openDeleteModal}>
          Delete
        </Button>
        <Button variant="info" onClick={openEditModal}>
          Edit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default IncomeDetailsModal;
