import { Button, Form, Modal } from "react-bootstrap";
import { useContext, useState } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import LoadingMessage from "@/components/ui/loadingMessage";
import EditExpenseForm from "./editExpenseForm";
import EditTransferForm from "./editTransferForm";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";

const EditTransactionModal = ({
  chosenTransaction,
  dateInfo,
  modal,
  setModal,
}) => {
  const { updateCategoriesFromTransaction } = useContext(CategoriesContext);
  const { transactionsRequest, putTransaction } =
    useContext(TransactionsContext);

  // Format the transaction's date to match the date input format
  const formattedDate = new Date(chosenTransaction.date)
    .toISOString()
    .split("T")[0];

  const [transaction, setTransaction] = useState({
    ...chosenTransaction,
    date: formattedDate,
  });
  const [formMeta, setFormMeta] = useState({
    status: "idle",
    error: null,
  });

  const closeEditModal = () => {
    setModal("transactionDetails");
  };

  const editTheTransaction = async (e) => {
    setFormMeta({ status: "loading", error: null });

    try {
      e.preventDefault();

      const formattedAmount = Number(transaction.amount);

      if (isNaN(formattedAmount)) {
        throw new Error("Invalid amount entered");
      }

      // Update the transaction in the backend and return the updated transaction
      const updatedTransaction = await putTransaction({
        ...transaction,
        amount: formattedAmount,
      });

      // Update the correlating category's state in the categories table
      updateCategoriesFromTransaction({
        oldTransaction: chosenTransaction,
        newTransaction: updatedTransaction,
      });

      setModal("none");

      setFormMeta({ status: "idle", error: null });
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
    }
  };

  return (
    <Modal show={modal === "editTransaction"} onHide={closeEditModal} centered>
      {formMeta.status === "idle" && (
        <>
          <Modal.Header>
            <Modal.Title>Edit Transaction Details</Modal.Title>
          </Modal.Header>
          <Form onSubmit={editTheTransaction}>
            <Modal.Body>
              {transaction.type === TRANSACTION_TYPES.EXPENSE && (
                <EditExpenseForm
                  dateInfo={dateInfo}
                  transaction={transaction}
                  setTransaction={setTransaction}
                />
              )}
              {transaction.type === TRANSACTION_TYPES.TRANSFER && (
                <EditTransferForm
                  dateInfo={dateInfo}
                  transaction={transaction}
                  setTransaction={setTransaction}
                />
              )}
              {formMeta.error && (
                <p className="text-center text-danger">{formMeta.error}</p>
              )}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="text-nowrap">
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        </>
      )}
      {formMeta.status === "loading" && (
        <LoadingMessage message={transactionsRequest.message} />
      )}
    </Modal>
  );
};

export default EditTransactionModal;
