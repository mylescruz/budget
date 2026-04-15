import ErrorMessage from "@/components/ui/errorMessage";
import LoadingMessage from "@/components/ui/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const DeleteTransactionModal = ({
  chosenTransaction,
  dateInfo,
  modal,
  setModal,
}) => {
  const { updateCategoriesFromTransaction } = useContext(CategoriesContext);
  const { deleteTransaction } = useContext(TransactionsContext);
  const [deletingTransaction, setDeletingTransaction] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const closeDeleteModal = () => {
    setModal("transactionDetails");
  };

  const confirmDelete = async () => {
    setDeletingTransaction(true);

    try {
      // Deletes a transaction from the transactions array by sending a DELETE request to the API
      await deleteTransaction(chosenTransaction._id);

      // Update the correlating category's state in the categories table
      updateCategoriesFromTransaction({
        oldTransaction: chosenTransaction,
        newTransaction: null,
      });

      setErrorOccurred(false);

      setModal("none");
    } catch (error) {
      setErrorOccurred(true);
      return;
    } finally {
      setDeletingTransaction(false);
    }
  };

  return (
    <Modal
      show={modal === "deleteTransaction"}
      onHide={closeDeleteModal}
      centered
    >
      {!deletingTransaction ? (
        <>
          <Modal.Header closeButton>Delete Transaction</Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this transaction?</p>
            {errorOccurred && <ErrorMessage />}
          </Modal.Body>
          <Modal.Footer className="d-flex flex-row justify-content-between">
            <Button variant="secondary" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <LoadingMessage message="Deleting this transaction" />
      )}
    </Modal>
  );
};

export default DeleteTransactionModal;
