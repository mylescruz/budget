import { useState } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import todayInfo from "@/helpers/todayInfo";
import LoadingMessage from "../ui/loadingMessage";
import PaycheckForm from "./incomeTypeForms/paycheckForm";
import SaleForm from "./incomeTypeForms/saleForm";
import GiftForm from "./incomeTypeForms/giftForm";
import UnemploymentForm from "./incomeTypeForms/unemploymentForm";
import {
  INCOME_TYPES,
  INCOME_TYPES_LIST,
  PAYCHECK_FREQUENCIES,
} from "@/lib/constants/income";
import handleObjectInput from "@/helpers/handleObjectInput";
import ErrorMessage from "../ui/errorMessage";

const AddIncomeModal = ({
  year,
  postIncome,
  incomeRequest,
  modal,
  setModal,
}) => {
  const sourceDate = year === todayInfo.year ? todayInfo.date : `${year}-01-01`;

  const emptySource = {
    incomeType: INCOME_TYPES.PAYCHECK,
    date: sourceDate,
    source: "",
    description: "",
    gross: "",
    deductions: "",
    amount: "",
    repeating: false,
    frequency: PAYCHECK_FREQUENCIES.WEEKLY,
    endRepeatDate: sourceDate,
    new: true,
  };

  const [newSource, setNewSource] = useState(emptySource);
  const [formMeta, setFormMeta] = useState({ status: "idle", error: null });

  const handleInput = (e) => {
    if (e.target.id === "incomeType") {
      setNewSource({ ...emptySource, incomeType: e.target.value });
    } else {
      handleObjectInput({ e, setObject: setNewSource });
    }
  };

  const setRepeating = () => {
    setNewSource((prev) => ({
      ...prev,
      repeating: !prev.repeating,
    }));
  };

  const addNewMoneyIn = async (e) => {
    e.preventDefault();

    setFormMeta({ status: "loading", error: null });

    try {
      await postIncome(newSource);

      closeAddModal();
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
    }
  };

  const closeAddModal = () => {
    setModal("none");

    setNewSource(emptySource);

    setFormMeta({ status: "idle", error: null });
  };

  const incomeFormProps = {
    src: newSource,
    handleInput: handleInput,
    year: year,
  };

  return (
    <Modal show={modal === "addIncome"} onHide={closeAddModal} centered>
      {formMeta.status === "idle" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Enter income information</Modal.Title>
          </Modal.Header>

          <Form onSubmit={addNewMoneyIn}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>What type of income is this?</Form.Label>
                <Form.Select
                  id="incomeType"
                  className="h-100"
                  value={newSource.incomeType}
                  onChange={handleInput}
                  required
                >
                  {INCOME_TYPES_LIST.map((incomeType, index) => (
                    <option key={index} value={incomeType}>
                      {incomeType}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {newSource.incomeType === INCOME_TYPES.PAYCHECK && (
                <PaycheckForm
                  setRepeating={setRepeating}
                  {...incomeFormProps}
                />
              )}
              {newSource.incomeType === INCOME_TYPES.SALE && (
                <SaleForm {...incomeFormProps} />
              )}
              {newSource.incomeType === INCOME_TYPES.GIFT && (
                <GiftForm {...incomeFormProps} />
              )}
              {newSource.incomeType === INCOME_TYPES.UNEMPLOYMENT && (
                <UnemploymentForm {...incomeFormProps} />
              )}
              {formMeta.error && <ErrorMessage message={formMeta.error} />}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={closeAddModal}>
                Close
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={
                  newSource.incomeType === INCOME_TYPES.PAYCHECK &&
                  newSource.amount > newSource.gross
                }
              >
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </>
      )}
      {formMeta.status === "loading" && (
        <LoadingMessage message={incomeRequest.message} />
      )}
    </Modal>
  );
};

export default AddIncomeModal;
