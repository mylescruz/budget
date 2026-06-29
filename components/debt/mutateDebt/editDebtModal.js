import DateInput from "@/components/ui/input/dateInput";
import NumberInput from "@/components/ui/input/numberInput";
import TextInput from "@/components/ui/input/textInput";
import LoadingMessage from "@/components/ui/loadingMessage";
import { DEBT_TYPE } from "@/lib/constants/debt";
import { REQUEST_STATUS } from "@/lib/constants/requests";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

const EditDebtModal = ({ debt, setDebt, modal, setModal }) => {
  const [form, setForm] = useState({
    status: REQUEST_STATUS.IDLE,
    error: null,
  });

  const handleInput = (e) => {
    setDebt((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const closeEditDebtModal = () => {
    setModal(null);
  };

  const saveChanges = () => {
    try {
      setForm({ status: REQUEST_STATUS.LOADING, error: null });

      setModal(null);
    } catch (error) {
      setForm({ status: REQUEST_STATUS.IDLE, error: error.message });
    }
  };

  return (
    <Modal show={modal === "EDIT"} onHide={closeEditDebtModal} centered>
      {form.status === REQUEST_STATUS.IDLE && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Edit Debt</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {debt.type === DEBT_TYPE.CREDIT_CARD && (
              <>
                <TextInput
                  id={"lender"}
                  label={"Who is the credit card servicer?"}
                  value={debt.lender}
                  handleInput={handleInput}
                />
                <NumberInput
                  id={"currentBalance"}
                  label={"What is the current balance?"}
                  value={debt.currentBalance}
                  handleInput={handleInput}
                  min={0.01}
                />
                <NumberInput
                  id={"creditLimit"}
                  label={"What is the card's credit limit?"}
                  value={debt.creditLimit}
                  handleInput={handleInput}
                  min={0.01}
                />
                <NumberInput
                  id={"apr"}
                  label={"What is the Annual Percentage Rate (APR)?"}
                  value={debt.apr}
                  handleInput={handleInput}
                  min={0.01}
                />
                <NumberInput
                  id={"monthlyPayment"}
                  label={"What is your current monthly payment?"}
                  value={debt.monthlyPayment}
                  handleInput={handleInput}
                  min={0}
                />
                <NumberInput
                  id={"dueDate"}
                  label={"What day of the month is your payment due?"}
                  value={debt.dueDate}
                  handleInput={handleInput}
                  min={1}
                  max={31}
                />
              </>
            )}
            {debt.type === DEBT_TYPE.LOAN && (
              <>
                <TextInput
                  id={"lender"}
                  label={"What is the lender's name?"}
                  value={debt.lender}
                  handleInput={handleInput}
                />
                <NumberInput
                  id={"currentBalance"}
                  label={"What is the current balance?"}
                  value={debt.currentBalance}
                  handleInput={handleInput}
                  min={0.01}
                />
                <NumberInput
                  id={"originalBalance"}
                  label={"What was the loan's original balance?"}
                  value={debt.originalBalance}
                  handleInput={handleInput}
                  min={0.01}
                />
                <NumberInput
                  id={"apr"}
                  label={"What is the Annual Percentage Rate (APR)?"}
                  value={debt.apr}
                  handleInput={handleInput}
                  min={0.01}
                />
                <DateInput
                  id={"startDate"}
                  label={"When did this loan start?"}
                  value={debt.startDate}
                  handleInput={handleInput}
                />
                <DateInput
                  id={"targetPayoffDate"}
                  label={"What is the target payoff date?"}
                  value={debt.targetPayoffDate}
                  handleInput={handleInput}
                />
                <NumberInput
                  id={"monthlyPayment"}
                  label={"What is your current monthly payment?"}
                  value={debt.monthlyPayment}
                  handleInput={handleInput}
                  min={0}
                />
                <NumberInput
                  id={"dueDate"}
                  label={"What day of the month is your payment due?"}
                  value={debt.dueDate}
                  handleInput={handleInput}
                  min={1}
                  max={31}
                />
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="d-flex flex-row justify-content-between">
            <Button variant="secondary" onClick={closeEditDebtModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveChanges}>
              Save
            </Button>
          </Modal.Footer>
        </>
      )}
      {form.status === REQUEST_STATUS.LOADING && (
        <LoadingMessage message={reqStatus.message} />
      )}
    </Modal>
  );
};

export default EditDebtModal;
