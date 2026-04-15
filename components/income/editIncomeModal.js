import ErrorMessage from "@/components/ui/errorMessage";
import LoadingMessage from "@/components/ui/loadingMessage";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import PaycheckForm from "./incomeTypeForms/paycheckForm";
import SaleForm from "./incomeTypeForms/saleForm";
import GiftForm from "./incomeTypeForms/giftForm";
import UnemploymentForm from "./incomeTypeForms/unemploymentForm";
import { INCOME_TYPES } from "@/lib/constants/income";
import handleObjectInput from "@/helpers/handleObjectInput";

const EditIncomeModal = ({
  chosenSource,
  setChosenSource,
  putIncome,
  year,
  modal,
  setModal,
}) => {
  const [status, setStatus] = useState("editing");

  const handleInput = (e) => {
    handleObjectInput({ e, setObject: setChosenSource });
  };

  const closeEditModal = () => {
    setStatus("editing");

    setModal("details");
  };

  const updatePaycheck = async (e) => {
    e.preventDefault();

    setStatus("loading");

    try {
      await putIncome({
        ...chosenSource,
        oldDate: chosenSource.date,
      });

      closeEditModal();
    } catch (error) {
      setStatus("error");
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
      {status !== "loading" && (
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
              {status === "error" && <ErrorMessage />}
            </Modal.Body>
            <Modal.Footer className="my-2 d-flex justify-content-between">
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
      {status === "loading" && <LoadingMessage message="Editting the source" />}
    </Modal>
  );
};

export default EditIncomeModal;
