import LoadingMessage from "@/components/ui/loadingMessage";
import { DEBT_TYPE, DEBT_TYPE_OPTIONS, LOAN_TYPE } from "@/lib/constants/debt";
import { REQUEST_STATUS } from "@/lib/constants/requests";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import AddLoanForm from "./addLoanForm";
import AddCreditCardForm from "./addCreditCardForm";
import ErrorMessage from "@/components/ui/errorMessage";

const AddDebtModal = ({ modal, setModal, postDebt }) => {
  const debt = {
    type: DEBT_TYPE.LOAN,
    lender: "",
    currentBalance: "",
    apr: "",
    monthlyPayment: "",
    notes: "",
  };

  // Add specific fields for Loan type debt
  const newLoan = {
    ...debt,
    loanType: LOAN_TYPE.PERSONAL,
    originalBalance: "",
    startDate: "",
    targetPayoffDate: "",
  };

  // Add specific fields for Credit Card type debt
  const newCreditCard = {
    ...debt,
    type: DEBT_TYPE.CREDIT_CARD,
    creditLimit: "",
    hasPromoAPR: false,
    promoAPR: "",
    promoAPREndDate: "",
  };

  const [newDebt, setNewDebt] = useState(newLoan);
  const [form, setForm] = useState({
    status: REQUEST_STATUS.IDLE,
    error: null,
  });

  const closeAddDebtModal = () => {
    setModal(null);
  };

  // Change the type of a debt
  const handleType = (e) => {
    const type = e.target.value;

    setNewDebt((prev) => {
      if (type === DEBT_TYPE.LOAN) {
        return { ...newLoan };
      } else {
        return { ...newCreditCard };
      }
    });
  };

  const handleInput = (e) => {
    setNewDebt((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const addNewDebt = async () => {
    try {
      setForm({ status: REQUEST_STATUS.LOADING, error: null });

      await postDebt(newDebt);

      setModal(null);
    } catch (error) {
      setForm({ status: REQUEST_STATUS.IDLE, error: error.message });
    }
  };

  return (
    <Modal centered show={modal === "ADD"} onHide={closeAddDebtModal}>
      {/* Loading Modal */}
      {form.status === REQUEST_STATUS.LOADING && (
        <LoadingMessage message="Adding your new debt" />
      )}

      {/* Add Debt Form */}
      {form.status === REQUEST_STATUS.IDLE && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Add New Debt</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="type" className={"mb-2"}>
              <Form.Label>
                What type of debt is this?{" "}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                className={"h-100"}
                value={newDebt.type}
                onChange={(e) => handleType(e)}
                required
              >
                {DEBT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {newDebt.type === DEBT_TYPE.LOAN && (
              <AddLoanForm
                debt={newDebt}
                setDebt={setNewDebt}
                handleInput={handleInput}
              />
            )}
            {newDebt.type === DEBT_TYPE.CREDIT_CARD && (
              <AddCreditCardForm
                debt={newDebt}
                setDebt={setNewDebt}
                handleInput={handleInput}
              />
            )}
          </Modal.Body>
          {form.error && <ErrorMessage message={form.error} />}
          <Modal.Footer className="d-flex justify-content-between">
            <Button onClick={closeAddDebtModal} variant="secondary">
              Cancel
            </Button>
            <Button onClick={addNewDebt} variant="primary">
              Add
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default AddDebtModal;
