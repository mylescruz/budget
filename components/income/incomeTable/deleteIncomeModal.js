import { Button, Modal } from "react-bootstrap";
import { useState } from "react";
import LoadingMessage from "@/components/layout/loadingMessage";
import ErrorMessage from "@/components/layout/errorMessage";
import dateFormatter from "@/helpers/dateFormatter";

const DeleteIncomeModal = ({
  source,
  deleteIncome,
  showModal,
  setShowModal,
}) => {
  const [status, setStatus] = useState("confirming");

  const closeDeleteModal = () => {
    setStatus("confirming");
    setShowModal("none");
  };

  const confirmDelete = async () => {
    setStatus("deleting");

    try {
      await deleteIncome(source);

      closeDeleteModal();
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    }
  };

  return (
    <Modal show={showModal === "delete"} onHide={closeDeleteModal} centered>
      {status !== "deleting" && (
        <>
          <Modal.Header closeButton>Delete Income</Modal.Header>
          <Modal.Body>
            <p className="mb-2">
              Are you sure you want to delete this source of income:{" "}
              {source.name} on {dateFormatter(source.date)}?
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
