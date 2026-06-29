import ErrorMessage from "@/components/ui/errorMessage";
import DateInput from "@/components/ui/input/dateInput";
import NumberInput from "@/components/ui/input/numberInput";
import TextInput from "@/components/ui/input/textInput";
import LoadingMessage from "@/components/ui/loadingMessage";
import { DEBT_TYPE } from "@/lib/constants/debt";
import { REQUEST_STATUS } from "@/lib/constants/requests";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

const EditDebtModal = ({ debt, modal, setModal, putDebt, reqStatus }) => {
  const [selectedDebt, setSelectedDebt] = useState(debt);
  const [form, setForm] = useState({
    status: REQUEST_STATUS.IDLE,
    error: null,
  });

  const handleInput = (e) => {
    setSelectedDebt((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const closeEditDebtModal = () => {
    setModal(null);
  };

  const saveChanges = async () => {
    try {
      setForm({ status: REQUEST_STATUS.LOADING, error: null });

      await putDebt(selectedDebt);

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
            <Modal.Title>Edit your {debt.type}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <NumberInput
              id={"currentBalance"}
              label={"What is the current balance?"}
              value={selectedDebt.currentBalance}
              handleInput={handleInput}
              min={0.01}
            />
            <NumberInput
              id={"apr"}
              label={"What is the Annual Percentage Rate (APR)?"}
              value={selectedDebt.apr}
              handleInput={handleInput}
              min={0.01}
            />
            <NumberInput
              id={"monthlyPayment"}
              label={"What is your current monthly payment?"}
              value={selectedDebt.monthlyPayment}
              handleInput={handleInput}
              min={0}
            />
            {selectedDebt.type === DEBT_TYPE.CREDIT_CARD && (
              <NumberInput
                id={"creditLimit"}
                label={"What is the card's credit limit?"}
                value={selectedDebt.creditLimit}
                handleInput={handleInput}
                min={0.01}
              />
            )}
            {form.error && <ErrorMessage message={form.error} />}
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
