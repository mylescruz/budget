import { Button, Modal } from "react-bootstrap";
import ExpenseDetails from "./expenseDetails";
import TransferDetails from "./transferDetails";
import CategoryDetails from "./categoryDetails";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";

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
        <Modal.Title>{`${chosenTransaction.type} Details`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {chosenTransaction.type === TRANSACTION_TYPES.EXPENSE && (
          <ExpenseDetails chosenTransaction={chosenTransaction} />
        )}
        {chosenTransaction.type === TRANSACTION_TYPES.TRANSFER && (
          <TransferDetails chosenTransaction={chosenTransaction} />
        )}
        {(chosenTransaction.type === "Category" ||
          chosenTransaction.type === "Subcategory") && (
          <CategoryDetails chosenTransaction={chosenTransaction} />
        )}
      </Modal.Body>
      {(chosenTransaction.type === TRANSACTION_TYPES.EXPENSE ||
        chosenTransaction.type === TRANSACTION_TYPES.TRANSFER) && (
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
