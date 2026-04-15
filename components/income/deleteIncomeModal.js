import { Button, Modal } from "react-bootstrap";
import { useState } from "react";
import LoadingMessage from "@/components/ui/loadingMessage";
import ErrorMessage from "@/components/ui/errorMessage";
import dateFormatter from "@/helpers/dateFormatter";

const DeleteIncomeModal = ({ chosenSource, deleteIncome, modal, setModal }) => {
  const [status, setStatus] = useState("confirming");

  const closeDeleteModal = () => {
    setStatus("confirming");

    setModal("none");
  };

  const confirmDelete = async () => {
    setStatus("deleting");

    try {
      await deleteIncome(chosenSource);

      closeDeleteModal();
    } catch (error) {
      setStatus("error");
      return;
    }
  };

  return (
    <Modal show={modal === "deleteIncome"} onHide={closeDeleteModal} centered>
      {status !== "deleting" && (
        <>
          <Modal.Header closeButton>Delete Income</Modal.Header>
          <Modal.Body>
            <p className="mb-2">
              Are you sure you want to delete this source of income:{" "}
              {chosenSource.name} on {dateFormatter(chosenSource.date)}?
            </p>
            {status === "error" && <ErrorMessage />}
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
      {status === "deleting" && (
        <LoadingMessage message="Deleting this income source" />
      )}
    </Modal>
  );
};

export default DeleteIncomeModal;
