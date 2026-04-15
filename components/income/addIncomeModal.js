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

const AddIncomeModal = ({
  year,
  postIncome,
  incomeRequest,
  modal,
  setModal,
}) => {
  const sourceDate = year === todayInfo.year ? todayInfo.date : `${year}-01-01`;

  const emptySource = {
    type: INCOME_TYPES.PAYCHECK,
    date: sourceDate,
    name: "",
    description: "",
    gross: "",
    deductions: "",
    amount: "",
    repeating: false,
    frequency: PAYCHECK_FREQUENCIES.WEEKLY,
    endRepeatDate: sourceDate,
    new: true,
  };

  const [source, setSource] = useState(emptySource);
  const [formMeta, setFormMeta] = useState({ status: "idle", error: null });

  const handleInput = (e) => {
    if (e.target.id === "type") {
      setSource({ ...emptySource, type: e.target.value });
    } else {
      handleObjectInput({ e, setObject: setSource });
    }
  };

  const setRepeating = () => {
    setSource((prev) => ({
      ...prev,
      repeating: !prev.repeating,
    }));
  };

  const addNewMoneyIn = async (e) => {
    e.preventDefault();

    setFormMeta({ status: "loading", error: null });

    try {
      await postIncome(source);

      closeAddModal();
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
    }
  };

  const closeAddModal = () => {
    setModal("none");

    setSource(emptySource);

    setFormMeta({ status: "idle", error: null });
  };

  const incomeFormProps = {
    source: source,
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
                  id="type"
                  className="h-100"
                  value={source.type}
                  onChange={handleInput}
                  required
                >
                  {INCOME_TYPES_LIST.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {source.type === INCOME_TYPES.PAYCHECK && (
                <PaycheckForm
                  setRepeating={setRepeating}
                  {...incomeFormProps}
                />
              )}
              {source.type === INCOME_TYPES.SALE && (
                <SaleForm {...incomeFormProps} />
              )}
              {source.type === INCOME_TYPES.GIFT && (
                <GiftForm {...incomeFormProps} />
              )}
              {source.type === INCOME_TYPES.UNEMPLOYMENT && (
                <UnemploymentForm {...incomeFormProps} />
              )}
              {formMeta.error && (
                <p className="text-center text-danger small">
                  &#9432; {formMeta.error}
                </p>
              )}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={closeAddModal}>
                Close
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={
                  source.type === INCOME_TYPES.PAYCHECK &&
                  source.amount > source.gross
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
