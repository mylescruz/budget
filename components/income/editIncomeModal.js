import LoadingMessage from "@/components/ui/loadingMessage";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import PaycheckForm from "./incomeTypeForms/paycheckForm";
import SaleForm from "./incomeTypeForms/saleForm";
import GiftForm from "./incomeTypeForms/giftForm";
import UnemploymentForm from "./incomeTypeForms/unemploymentForm";
import { INCOME_TYPES } from "@/lib/constants/income";
import handleObjectInput from "@/helpers/handleObjectInput";
import ErrorMessage from "../ui/errorMessage";

const EditIncomeModal = ({
  chosenSource,
  setChosenSource,
  putIncome,
  incomeRequest,
  year,
  modal,
  setModal,
}) => {
  const [formMeta, setFormMeta] = useState({ status: "idle", error: null });

  const handleInput = (e) => {
    handleObjectInput({ e, setObject: setChosenSource });
  };

  const closeEditModal = () => {
    setFormMeta({ status: "idle", error: null });

    setModal("details");
  };

  const updatePaycheck = async (e) => {
    e.preventDefault();

    setFormMeta({ status: "loading", error: null });

    try {
      await putIncome({
        ...chosenSource,
        oldDate: chosenSource.date,
      });

      closeEditModal();
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
    }
  };

  const incomeFormProps = {
    source: chosenSource,
    handleInput: handleInput,
    year: year,
  };

  return (
    <Modal show={modal === "editIncome"} onHide={closeEditModal} centered>
      {formMeta.status === "idle" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Edit Income</Modal.Title>
          </Modal.Header>
          <Form onSubmit={updatePaycheck}>
            <Modal.Body>
              {chosenSource.type === INCOME_TYPES.PAYCHECK && (
                <PaycheckForm {...incomeFormProps} />
              )}
              {chosenSource.type === INCOME_TYPES.SALE && (
                <SaleForm {...incomeFormProps} />
              )}
              {chosenSource.type === INCOME_TYPES.GIFT && (
                <GiftForm {...incomeFormProps} />
              )}
              {chosenSource.type === INCOME_TYPES.UNEMPLOYMENT && (
                <UnemploymentForm {...incomeFormProps} />
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
        <LoadingMessage message={incomeRequest.message} />
      )}
    </Modal>
  );
};

export default EditIncomeModal;
