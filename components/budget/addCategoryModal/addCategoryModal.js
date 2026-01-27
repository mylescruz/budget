import LoadingMessage from "@/components/layout/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import SubcategoriesPage from "./subcategoriesPage";
import ConfirmationPage from "./confirmationPage";
import ErrorMessage from "@/components/layout/errorMessage";
import centsToDollars from "@/helpers/centsToDollars";
import CategoryDetailsForm from "@/components/category/categoryDetailsForm";

const AddCategoryModal = ({ addCategoryClicked, setAddCategoryClicked }) => {
  const emptyCategory = {
    name: "",
    color: "#000000",
    budget: "",
    actual: "",
    dueDate: "",
    frequency: "Monthly",
    fixed: false,
    hasSubcategory: false,
    subcategories: [],
  };

  const { postCategory } = useContext(CategoriesContext);
  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [status, setStatus] = useState("inputting");
  const [modalPage, setModalPage] = useState("details");

  const confirmDetails = () => {
    if (newCategory.hasSubcategory) {
      setModalPage("subcategories");
    } else {
      setNewCategory({
        ...newCategory,
        budget: parseFloat(newCategory.budget),
      });
      setModalPage("confirm");
    }
  };

  const backToDetails = () => {
    setModalPage("details");
  };

  const backFromConfirm = () => {
    if (newCategory.hasSubcategory) {
      setModalPage("subcategories");
    } else {
      setModalPage("details");
    }
  };

  const openConfirmation = () => {
    if (newCategory.fixed) {
      let subcategoryTotal = 0;

      const subcategories = newCategory.subcategories.map((subcategory) => {
        const parsedActual = parseFloat(subcategory.actual);

        subcategoryTotal = subcategoryTotal + parsedActual * 100;
        return {
          ...subcategory,
          actual: parsedActual,
        };
      });

      setNewCategory({
        ...newCategory,
        budget: centsToDollars(subcategoryTotal),
        subcategories: subcategories,
      });
    } else {
      setNewCategory({
        ...newCategory,
        subcategories: newCategory.subcategories.map((subcategory) => {
          return { ...subcategory, actual: 0 };
        }),
      });
    }

    setModalPage("confirm");
  };

  const closeModal = () => {
    setNewCategory(emptyCategory);

    setModalPage("details");
    setStatus("inputting");
    setAddCategoryClicked(false);
  };

  const addNewCategory = async () => {
    setStatus("posting");

    try {
      await postCategory(newCategory);

      closeModal();
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    }
  };

  return (
    <Modal show={addCategoryClicked} onHide={closeModal} centered>
      {status !== "posting" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Enter new category</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {modalPage === "details" && (
              <CategoryDetailsForm
                newCategory={newCategory}
                setNewCategory={setNewCategory}
              />
            )}
            {modalPage === "subcategories" && (
              <SubcategoriesPage
                newCategory={newCategory}
                setNewCategory={setNewCategory}
              />
            )}
            {modalPage === "confirm" && (
              <ConfirmationPage newCategory={newCategory} />
            )}
          </Modal.Body>
          <Modal.Footer>
            {modalPage === "details" && (
              <div className="w-100 d-flex justify-content-between">
                <Button variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmDetails}
                  disabled={
                    newCategory.name === "" ||
                    (!newCategory.fixed && newCategory.budget === "") ||
                    (newCategory.fixed &&
                      !newCategory.hasSubcategory &&
                      (newCategory.budget === "" || newCategory.dueDate === ""))
                  }
                >
                  Next
                </Button>
              </div>
            )}
            {modalPage === "subcategories" && (
              <div className="w-100 d-flex justify-content-between">
                <Button variant="secondary" onClick={backToDetails}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={openConfirmation}
                  disabled={newCategory.subcategories.length === 0}
                >
                  Next
                </Button>
              </div>
            )}
            {modalPage === "confirm" && (
              <div className="w-100 d-flex justify-content-between">
                <Button variant="secondary" onClick={backFromConfirm}>
                  Back
                </Button>
                <Button variant="primary" onClick={addNewCategory}>
                  Add
                </Button>
              </div>
            )}
          </Modal.Footer>
        </>
      )}
      {status === "posting" && (
        <LoadingMessage message="Adding the new category" />
      )}
      {status === "error" && <ErrorMessage />}
    </Modal>
  );
};

export default AddCategoryModal;
