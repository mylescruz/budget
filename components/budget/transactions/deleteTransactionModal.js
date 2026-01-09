import ErrorMessage from "@/components/layout/errorMessage";
import LoadingMessage from "@/components/layout/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const DeleteTransactionModal = ({ transaction, dateInfo, modal, setModal }) => {
  const { getCategories } = useContext(CategoriesContext);
  const { deleteTransaction } = useContext(TransactionsContext);
  const [deletingTransaction, setDeletingTransaction] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const closeDelete = () => {
    setModal("details");
  };

  const confirmDelete = async () => {
    setDeletingTransaction(true);

    try {
      // Deletes a transaction from the transactions array by sending a DELETE request to the API
      await deleteTransaction(transaction);

      // Fetch the categories to update the state for the categories table
      await getCategories(dateInfo.month, dateInfo.year);

      setErrorOccurred(false);

      setModal("none");
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setDeletingTransaction(false);
    }
  };

  return (
    <Modal show={modal === "delete"} onHide={closeDelete} centered>
      {!deletingTransaction ? (
        <>
          <Modal.Header closeButton>Delete Transaction</Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this transaction?</p>
            {errorOccurred && <ErrorMessage />}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="info" onClick={closeDelete}>
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
