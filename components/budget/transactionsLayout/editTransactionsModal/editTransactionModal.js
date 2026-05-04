import { Button, Form, Modal } from "react-bootstrap";
import { useContext, useState } from "react";
import LoadingMessage from "@/components/ui/loadingMessage";
import EditExpenseForm from "./editExpenseForm";
import EditTransferForm from "./editTransferForm";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import ErrorMessage from "@/components/ui/errorMessage";
import { BudgetContext } from "@/contexts/BudgetContext";

const EditTransactionModal = ({
  chosenTransaction,
  dateInfo,
  modal,
  setModal,
}) => {
  const { budgetRequest, putTransaction } = useContext(BudgetContext);

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
    setModal("DETAILS");
  };

  const editTheTransaction = async (e) => {
    setFormMeta({ status: "loading", error: null });

    try {
      e.preventDefault();

      const formattedAmount = Number(transaction.amount);

      if (isNaN(formattedAmount)) {
        throw new Error("Invalid amount entered");
      }

      await putTransaction({
        ...transaction,
        amount: formattedAmount,
      });

      setModal(null);

      setFormMeta({ status: "idle", error: null });
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
    }
  };

  return (
    <Modal show={modal === "EDIT"} onHide={closeEditModal} centered>
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
              {formMeta.error && <ErrorMessage message={formMeta.error} />}
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
        <LoadingMessage message={budgetRequest.message} />
      )}
    </Modal>
  );
};

export default EditTransactionModal;
