import dateToMonthInfo from "@/helpers/dateToMonthInfo";
import useHistory from "@/hooks/useHistory";
import { useSession } from "next-auth/react";
import { Button, Modal } from "react-bootstrap";
import LoadingMessage from "../layout/loadingMessage";
import ErrorMessage from "../layout/errorMessage";
import { useContext, useState } from "react";
import { IncomeContext } from "@/contexts/IncomeContext";

const DeleteIncomeModal = ({
  paycheck,
  showDelete,
  setShowDelete,
  setShowDetails,
}) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const { deleteIncome, getMonthIncome } = useContext(IncomeContext);
  const { putHistory, getMonthHistory } = useHistory(session.user.username);
  const [deletingPaycheck, setDeletingPaycheck] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const closeDelete = () => {
    setShowDelete(false);
    setShowDetails(true);
  };

  const confirmDelete = async () => {
    setDeletingPaycheck(true);

    try {
      // Deletes a paycheck from the income array by sending a DELETE request to the API
      await deleteIncome(paycheck);

      // Update the history for the paycheck's month
      const paycheckMonthInfo = dateToMonthInfo(paycheck.date);

      // Get the income for the month of the paycheck
      const monthIncome = getMonthIncome(paycheckMonthInfo);

      // Get the history for the month of the paycheck
      const paycheckMonth = getMonthHistory(paycheckMonthInfo);

      if (paycheckMonth) {
        // Update the budget for the month the paycheck is in
        const updatedBudget = monthIncome - paycheck.net;
        const updatedLeftover = parseFloat(
          (updatedBudget - paycheckMonth.actual).toFixed(2)
        );

        // Update the budget and leftover in the history and send it to the API
        const updatedMonth = {
          ...paycheckMonth,
          budget: updatedBudget,
          leftover: updatedLeftover,
        };

        await putHistory(updatedMonth);
      }

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setDeletingPaycheck(false);
    }
  };

  return (
    <Modal show={showDelete} onHide={closeDelete} centered>
      {!deletingPaycheck ? (
        <>
          <Modal.Header closeButton>Delete Paycheck</Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this paycheck?
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
        <LoadingMessage message="Deleting the paycheck" />
      )}
    </Modal>
  );
};

export default DeleteIncomeModal;
