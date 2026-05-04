import { Button, Modal } from "react-bootstrap";
import ExpenseDetails from "./expenseDetails";
import TransferDetails from "./transferDetails";
import CategoryDetails from "./categoryDetails";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";

const TransactionDetailsModal = ({ chosenTransaction, modal, setModal }) => {
  const closeDetailsModal = () => {
    setModal("none");
  };

  // Flag to give the user the option to delete an expense transaction if its not fixed or delete a transfer
  const isAbleToDelete =
    (chosenTransaction.type === TRANSACTION_TYPES.EXPENSE &&
      !chosenTransaction.fixed) ||
    chosenTransaction.type === TRANSACTION_TYPES.TRANSFER;

  return (
    <Modal show={modal === "DETAILS"} onHide={closeDetailsModal} centered>
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
      {isAbleToDelete && (
        <Modal.Footer className="d-flex flex-row justify-content-between">
          <Button variant="danger" onClick={() => setModal("DELETE")}>
            Delete
          </Button>
          <Button variant="info" onClick={() => setModal("EDIT")}>
            Edit
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default TransactionDetailsModal;
