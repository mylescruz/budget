import { useState } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import todayInfo from "@/helpers/todayInfo";
import LoadingMessage from "../layout/loadingMessage";
import ErrorMessage from "../layout/errorMessage";
import PaycheckForm from "./incomeTypeForms/paycheckForm";
import LoanForm from "./incomeTypeForms/loanForm";
import SaleForm from "./incomeTypeForms/saleForm";
import GiftForm from "./incomeTypeForms/giftForm";
import UnemploymentForm from "./incomeTypeForms/unemploymentForm";

const incomeTypes = ["Paycheck", "Sale", "Gift", "Unemployment", "Loan"];

const AddIncomeModal = ({
  year,
  postIncome,
  showAddIncome,
  setShowAddIncome,
}) => {
  const emptySource = {
    type: "Paycheck",
    date: year === todayInfo.year ? todayInfo.date : `${year}-01-01`,
    name: "",
    description: "",
    gross: "",
    deductions: "",
    amount: "",
  };

  const [source, setSource] = useState(emptySource);
  const [status, setStatus] = useState("inputting");

  const handleInput = (e) => {
    if (e.target.id === "type") {
      setSource({ ...emptySource, type: e.target.value });
    } else {
      setSource({ ...source, [e.target.id]: e.target.value });
    }
  };

  const addNewMoneyIn = async (e) => {
    e.preventDefault();

    setStatus("loading");

    try {
      await postIncome(source);

      closeAddModal();
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    }
  };

  const closeAddModal = () => {
    setStatus("inputting");
    setSource(emptySource);
    setShowAddIncome(false);
  };

  const incomeFormProps = {
    source: source,
    handleInput: handleInput,
    year: year,
  };

  return (
    <Modal show={showAddIncome} onHide={closeAddModal} centered>
      {status !== "loading" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Enter income information</Modal.Title>
          </Modal.Header>

          <Form onSubmit={addNewMoneyIn}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>What type of income is this?</Form.Label>
                <Form.Select
                  id="type"
                  className="h-100"
                  value={source.type}
                  onChange={handleInput}
                  required
                >
                  {incomeTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {source.type === "Paycheck" && (
                <PaycheckForm {...incomeFormProps} />
              )}
              {source.type === "Sale" && <SaleForm {...incomeFormProps} />}
              {source.type === "Gift" && <GiftForm {...incomeFormProps} />}
              {source.type === "Unemployment" && (
                <UnemploymentForm {...incomeFormProps} />
              )}
              {source.type === "Loan" && <LoanForm {...incomeFormProps} />}
              {status === "error" && <ErrorMessage />}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={closeAddModal}>
                Close
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={
                  source.type === "Paycheck" && source.amount > source.gross
                }
              >
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </>
      )}
      {status === "loading" && (
        <LoadingMessage message="Adding the new income" />
      )}
    </Modal>
  );
};

export default AddIncomeModal;
