import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Modal, Row } from "react-bootstrap";

const TransactionSummaryModal = ({ transaction, showModal, setShowModal }) => {
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Transaction Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="m-2">Date: {dateFormatter(transaction.date)}</Row>
        <Row className="m-2">Store: {transaction.store}</Row>
        <Row className="m-2">Items Purchased: {transaction.items}</Row>
        <Row className="m-2">Category: {transaction.category}</Row>
        <Row className="m-2">Amount: {dollarFormatter(transaction.amount)}</Row>
      </Modal.Body>
    </Modal>
  );
};

export default TransactionSummaryModal;
