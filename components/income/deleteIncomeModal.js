import { Button, Modal } from "react-bootstrap";
import { useState } from "react";
import LoadingMessage from "@/components/ui/loadingMessage";
import dateFormatter from "@/helpers/dateFormatter";
import ErrorMessage from "../ui/errorMessage";

const DeleteIncomeModal = ({
  chosenSource,
  deleteIncome,
  incomeRequest,
  modal,
  setModal,
}) => {
  const [formMeta, setFormMeta] = useState({ status: "idle", error: null });

  const closeDeleteModal = () => {
    setModal("none");

    setFormMeta({ status: "idle", error: null });
  };

  const confirmDelete = async () => {
    setFormMeta({ status: "loading", error: null });

    try {
      await deleteIncome(chosenSource);

      closeDeleteModal();
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
    }
  };

  return (
    <Modal show={modal === "deleteIncome"} onHide={closeDeleteModal} centered>
      {formMeta.status === "idle" && (
        <>
          <Modal.Header closeButton>Delete Income</Modal.Header>
          <Modal.Body>
            <p className="mb-2">
              Are you sure you want to delete this source of income:{" "}
              {chosenSource.source} on {dateFormatter(chosenSource.date)}?
            </p>
            {formMeta.error && <ErrorMessage message={formMeta.error} />}
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <Button variant="secondary" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </>
      )}
      {formMeta.status === "loading" && (
        <LoadingMessage message={incomeRequest.message} />
      )}
    </Modal>
  );
};

export default DeleteIncomeModal;
