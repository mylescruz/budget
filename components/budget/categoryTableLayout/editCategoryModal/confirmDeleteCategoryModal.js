import ErrorMessage from "@/components/ui/errorMessage";
import LoadingMessage from "@/components/ui/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const ConfirmDeleteCategoryModal = ({ editedCategory, modal, setModal }) => {
  const { categoriesRequest, deleteCategory } = useContext(CategoriesContext);
  const { removeFixedCategoryTransactions } = useContext(TransactionsContext);

  const [formMeta, setFormMeta] = useState({ status: "idle", error: null });

  const closeDelete = () => {
    setModal("edit");
  };

  const removeCategory = async () => {
    setFormMeta({ status: "loading", error: null });

    try {
      await deleteCategory(editedCategory);

      // If the category is fixed, delete the correlating fixed transactions from the transactions state array
      if (editedCategory.fixed) {
        const categoryIds = new Set();

        if (editedCategory.subcategories.length > 0) {
          editedCategory.subcategories.forEach((subcategory) => {
            categoryIds.add(subcategory._id);
          });
        } else {
          categoryIds.add(editedCategory._id);
        }

        removeFixedCategoryTransactions(categoryIds);
      }

      setModal("none");

      setFormMeta({ status: "idle", error: null });
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
    }
  };

  return (
    <Modal show={modal === "delete"} onHide={closeDelete} centered>
      {formMeta.status === "idle" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Delete {editedCategory.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-center">
              Are you sure you want to delete this category and all its
              subcategories?
            </p>
            {formMeta.error && <ErrorMessage message={formMeta.error} />}
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
      {formMeta.status === "loading" && (
        <LoadingMessage message={categoriesRequest.message} />
      )}
    </Modal>
  );
};

export default ConfirmDeleteCategoryModal;
