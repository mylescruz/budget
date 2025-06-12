import dateToMonthInfo from "@/helpers/dateToMonthInfo";
import useHistory from "@/hooks/useHistory";
import { useSession } from "next-auth/react";
import { Button, Modal } from "react-bootstrap";

const DeleteIncomeModal = ({
  paycheck,
  deleteIncome,
  showDelete,
  setShowDelete,
  setShowDetails,
  getMonthIncome,
}) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const { putHistory, getMonthHistory } = useHistory(session.user.username);

  const closeDelete = () => {
    setShowDelete(false);
    setShowDetails(true);
  };

  const confirmDelete = async () => {
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
  };

  return (
    <Modal show={showDelete} onHide={closeDelete} centered>
      <Modal.Header closeButton>Delete Paycheck</Modal.Header>
      <Modal.Body>Are you sure you want to delete this paycheck?</Modal.Body>
      <Modal.Footer>
        <Button variant="info" onClick={closeDelete}>
          Cancel
        </Button>
        <Button variant="danger" onClick={confirmDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteIncomeModal;
