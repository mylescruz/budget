import ErrorMessage from "@/components/layout/errorMessage";
import LoadingMessage from "@/components/layout/loadingMessage";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import PaycheckForm from "../incomeTypeForms/paycheckForm";
import LoanForm from "../incomeTypeForms/loanForm";
import SaleForm from "../incomeTypeForms/saleForm";
import GiftForm from "../incomeTypeForms/giftForm";
import UnemploymentForm from "../incomeTypeForms/unemploymentForm";

const EditIncomeModal = ({
  source,
  putIncome,
  year,
  showModal,
  setShowModal,
}) => {
  const formattedSource = {
    ...source,
    amount: source.amount / 100,
  };

  if (source.type === "Paycheck") {
    formattedSource.gross = source.gross / 100;
    formattedSource.deductions = source.deductions / 100;
  }

  const [editedSource, setEditedSource] = useState(formattedSource);
  const [status, setStatus] = useState("editing");

  const handleInput = (e) => {
    setEditedSource({ ...editedSource, [e.target.id]: e.target.value });
  };

  const closeEditIncomeModal = () => {
    setStatus("editing");
    setShowModal("details");
  };

  const updatePaycheck = async (e) => {
    e.preventDefault();

    setStatus("loading");

    try {
      await putIncome({
        ...editedSource,
        oldDate: source.date,
      });

      closeEditIncomeModal();
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    }
  };

  const incomeFormProps = {
    source: editedSource,
    handleInput: handleInput,
    year: year,
  };

  return (
    <Modal show={showModal === "edit"} onHide={closeEditIncomeModal} centered>
      {status !== "loading" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Edit Income</Modal.Title>
          </Modal.Header>
          <Form onSubmit={updatePaycheck}>
            <Modal.Body>
              {editedSource.type === "Paycheck" && (
                <PaycheckForm {...incomeFormProps} />
              )}
              {editedSource.type === "Loan" && (
                <LoanForm {...incomeFormProps} />
              )}
              {editedSource.type === "Sale" && (
                <SaleForm {...incomeFormProps} />
              )}
              {editedSource.type === "Gift" && (
                <GiftForm {...incomeFormProps} />
              )}
              {editedSource.type === "Unemployment" && (
                <UnemploymentForm {...incomeFormProps} />
              )}
              {status === "error" && <ErrorMessage />}
            </Modal.Body>
            <Modal.Footer className="my-2 d-flex justify-content-between">
              <Button variant="secondary" onClick={closeEditIncomeModal}>
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
