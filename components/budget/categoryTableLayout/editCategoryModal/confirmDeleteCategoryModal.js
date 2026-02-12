import ErrorMessage from "@/components/layout/errorMessage";
import LoadingMessage from "@/components/layout/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const ConfirmDeleteCategoryModal = ({
  editedCategory,
  dateInfo,
  modal,
  setModal,
}) => {
  const { getCategories, deleteCategory } = useContext(CategoriesContext);

  const [status, setStatus] = useState("confirming");

  const closeDelete = () => {
    setModal("edit");
  };

  const removeCategory = async () => {
    setStatus("deleting");

    try {
      await deleteCategory(editedCategory._id);

      // Fetch the updated categories to show changes to the Fun Money category's budget
      await getCategories(dateInfo.month, dateInfo.year);

      setModal("none");
    } catch (error) {
      setStatus("error");
      return;
    }
  };

  return (
    <Modal show={modal === "delete"} onHide={closeDelete} centered>
      {status === "confirming" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Delete {editedCategory.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to delete this category and all its
              subcategories?
            </p>
          </Modal.Body>
          <Modal.Footer className="d-flex flex-row justify-content-between">
            <Button variant="secondary" onClick={closeDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={removeCategory}>
              Delete
            </Button>
          </Modal.Footer>
        </>
      )}
      {status === "deleting" && (
        <LoadingMessage
          message={`Deleting the category ${editedCategory.name}`}
        />
      )}
      {status === "error" && <ErrorMessage />}
    </Modal>
  );
};

export default ConfirmDeleteCategoryModal;
