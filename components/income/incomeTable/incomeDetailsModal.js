import centsToDollars from "@/helpers/centsToDollars";
import dateFormatter from "@/helpers/dateFormatter";
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
        <Modal.Title>Income Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="m-2">Date: {dateFormatter(source.date)}</Row>
        {source.type === "Paycheck" && (
          <>
            <Row className="m-2">Company: {source.name}</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Gross Income: {centsToDollars(source.gross)}
            </Row>
            <Row className="m-2">
              Deductions: {centsToDollars(source.deductions)}
            </Row>
            <Row className="m-2">
              Net Income: {centsToDollars(source.amount)}
            </Row>
          </>
        )}
        {source.type === "Sale" && (
          <>
            <Row className="m-2">Item Sold: {source.name}</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Sale Amount: {centsToDollars(source.amount)}
            </Row>
          </>
        )}
        {source.type === "Gift" && (
          <>
            <Row className="m-2">Received Gift From: {source.name}</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Gift Amount: {centsToDollars(source.amount)}
            </Row>
          </>
        )}
        {source.type === "Unemployment" && (
          <>
            <Row className="m-2">Received Unemployment from EDD</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Payout Amount: {centsToDollars(source.amount)}
            </Row>
          </>
        )}
        {source.type === "Loan" && (
          <>
            <Row className="m-2">Loan Servicer: {source.name}</Row>
            <Row className="m-2">Description: {source.description}</Row>
            <Row className="m-2">
              Loan Amount: {centsToDollars(source.amount)}
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
