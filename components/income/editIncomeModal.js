import ErrorMessage from "@/components/ui/errorMessage";
import LoadingMessage from "@/components/ui/loadingMessage";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import PaycheckForm from "./incomeTypeForms/paycheckForm";
import SaleForm from "./incomeTypeForms/saleForm";
import GiftForm from "./incomeTypeForms/giftForm";
import UnemploymentForm from "./incomeTypeForms/unemploymentForm";
import { INCOME_SOURCES } from "@/lib/constants/income";

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
    setChosenSource({ ...chosenSource, [e.target.id]: e.target.value });
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
      console.error(error);
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
              {chosenSource.type === INCOME_SOURCES.PAYCHECK && (
                <PaycheckForm {...incomeFormProps} />
              )}
              {chosenSource.type === INCOME_SOURCES.SALE && (
                <SaleForm {...incomeFormProps} />
              )}
              {chosenSource.type === INCOME_SOURCES.GIFT && (
                <GiftForm {...incomeFormProps} />
              )}
              {chosenSource.type === INCOME_SOURCES.UNEMPLOYMENT && (
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
