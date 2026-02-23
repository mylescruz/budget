import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Button, Col, Modal, Row } from "react-bootstrap";

const TransactionDetailsModal = ({ chosenTransaction, modal, setModal }) => {
  const closeDetailsModal = () => {
    setModal("none");
  };

  const openDeleteModal = () => {
    setModal("deleteTransaction");
  };

  const openEditModal = () => {
    setModal("editTransaction");
  };

  return (
    <Modal
      show={modal === "transactionDetails"}
      onHide={closeDetailsModal}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {!chosenTransaction.isCategory
            ? "Transaction"
            : chosenTransaction.items}{" "}
          Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="m-2">Date: {dateFormatter(chosenTransaction.date)}</Row>
        <Row className="m-2">Store: {chosenTransaction.store}</Row>
        {!chosenTransaction.isCategory && (
          <Row className="m-2">Items Purchased: {chosenTransaction.items}</Row>
        )}
        <Row className="m-2">Category: {chosenTransaction.category}</Row>
        <Row className="m-2">
          Amount: {dollarFormatter(chosenTransaction.amount)}
        </Row>
      </Modal.Body>
      {!chosenTransaction.fromCalendar && (
        <Modal.Footer className="d-flex flex-row justify-content-between">
          <Button variant="danger" onClick={openDeleteModal}>
            Delete
          </Button>
          <Button variant="info" onClick={openEditModal}>
            Edit
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default TransactionDetailsModal;
