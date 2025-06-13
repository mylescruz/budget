import ErrorMessage from "@/components/layout/errorMessage";
import LoadingMessage from "@/components/layout/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import deleteTransactionFromCategoryActual from "@/helpers/deleteTransactionFromCategoryActual";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const DeleteTransactionModal = ({
  transaction,
  showDelete,
  setShowDelete,
  setShowDetails,
}) => {
  const { categories, putCategories } = useContext(CategoriesContext);
  const { deleteTransaction } = useContext(TransactionsContext);
  const [deletingTransaction, setDeletingTransaction] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const closeDelete = () => {
    setShowDelete(false);
    setShowDetails(true);
  };

  const confirmDelete = async () => {
    setDeletingTransaction(true);

    try {
      // Deletes a transaction from the transactions array by sending a DELETE request to the API
      await deleteTransaction(transaction);

      // Updates the categories array with the new category actual value by sending a DELETE request to the API
      const updatedCategories = deleteTransactionFromCategoryActual(
        transaction,
        categories
      );
      await putCategories(updatedCategories);

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setDeletingTransaction(false);
    }
  };

  return (
    <Modal show={showDelete} onHide={closeDelete} centered>
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
