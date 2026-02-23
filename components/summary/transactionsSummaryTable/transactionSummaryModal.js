import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Modal, Row } from "react-bootstrap";

const TransactionSummaryModal = ({ chosenTransaction, modal, setModal }) => {
  const closeDetailsModal = () => {
    setModal("none");
  };

  return (
    <Modal
      show={modal === "transactionDetails"}
      onHide={closeDetailsModal}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Transaction Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="m-2">Date: {dateFormatter(chosenTransaction.date)}</Row>
        <Row className="m-2">Store: {chosenTransaction.store}</Row>
        <Row className="m-2">Items Purchased: {chosenTransaction.items}</Row>
        <Row className="m-2">Category: {chosenTransaction.category}</Row>
        <Row className="m-2">
          Amount: {dollarFormatter(chosenTransaction.amount)}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default TransactionSummaryModal;
