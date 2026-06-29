import ErrorMessage from "@/components/ui/errorMessage";
import LoadingMessage from "@/components/ui/loadingMessage";
import { REQUEST_STATUS } from "@/lib/constants/requests";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

const PaidOffDebtModal = ({
  debt,
  markDebtPaidOff,
  reqStatus,
  modal,
  setModal,
}) => {
  const [form, setForm] = useState({
    status: REQUEST_STATUS.IDLE,
    error: null,
  });

  const closePaidOffModal = () => {
    setModal(null);
  };

  const confirmPaidDebt = async () => {
    try {
      setForm({ status: REQUEST_STATUS.LOADING, error: null });

      await markDebtPaidOff(debt);

      setModal(null);
    } catch (error) {
      setForm({ status: REQUEST_STATUS.IDLE, error: error.message });
    }
  };

  return (
    <Modal show={modal === "PAID OFF"} onHide={closePaidOffModal} centered>
      {form.status === REQUEST_STATUS.IDLE && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Pay Off Debt</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Congrats on paying off your {debt.type.toLowerCase()} with{" "}
            {debt.lender}! That's a huge accomplishment! Confirm you paid it off
            below to mark off this debt.
            {form.error && <ErrorMessage message={form.error} />}
          </Modal.Body>
          <Modal.Footer className="d-flex flex-row justify-content-between">
            <Button variant="secondary" onClick={closePaidOffModal}>
              Cancel
            </Button>
            <Button variant="success" onClick={confirmPaidDebt}>
              Complete
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

export default PaidOffDebtModal;
