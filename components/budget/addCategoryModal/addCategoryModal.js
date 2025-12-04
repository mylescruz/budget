import LoadingMessage from "@/components/layout/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import CategoryDetailsPage from "./categoryDetailsPage";
import SubcategoriesPage from "./subcategoriesPage";
import ConfirmationPage from "./confirmationPage";
import ErrorMessage from "@/components/layout/errorMessage";

const AddCategoryModal = ({
  dateInfo,
  addCategoryClicked,
  setAddCategoryClicked,
}) => {
  const emptyCategory = {
    name: "",
    color: "#000000",
    budget: "",
    actual: 0,
    date: "",
    fixed: false,
    hasSubcategory: false,
    subcategories: [],
  };

  const { postCategory } = useContext(CategoriesContext);
  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [status, setStatus] = useState("inputting");
  const [showCategoryDetails, setShowCategoryDetails] = useState(true);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const confirmDetails = () => {
    setShowCategoryDetails(false);

    if (newCategory.hasSubcategory) {
      setShowSubcategories(true);
    } else {
      setNewCategory({
        ...newCategory,
        budget: parseFloat(newCategory.budget),
      });
      setShowConfirmation(true);
    }
  };

  const backToDetails = () => {
    setShowSubcategories(false);
    setShowCategoryDetails(true);
  };

  const backFromConfirm = () => {
    setShowConfirmation(false);

    if (newCategory.hasSubcategory) {
      setShowSubcategories(true);
    } else {
      setShowCategoryDetails(true);
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
        budget: subcategoryTotal / 100,
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

    setShowSubcategories(false);
    setShowConfirmation(true);
  };

  const closeModal = () => {
    setNewCategory(emptyCategory);

    setShowSubcategories(false);
    setShowConfirmation(false);
    setShowCategoryDetails(true);

    setStatus("inputting");

    setAddCategoryClicked(false);
  };

  const addNewCategory = async () => {
    setStatus("adding");

    try {
      await postCategory(newCategory);

      closeModal();
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    } finally {
      setStatus("inputting");
    }
  };

  return (
    <Modal show={addCategoryClicked} onHide={closeModal} centered>
      {status === "inputting" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Enter new category</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {showCategoryDetails && (
              <CategoryDetailsPage
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                dateInfo={dateInfo}
              />
            )}
            {showSubcategories && (
              <SubcategoriesPage
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                dateInfo={dateInfo}
              />
            )}
            {showConfirmation && <ConfirmationPage newCategory={newCategory} />}
          </Modal.Body>
          <Modal.Footer>
            {showCategoryDetails && (
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
                      (newCategory.budget === "" || newCategory.date === ""))
                  }
                >
                  Next
                </Button>
              </div>
            )}
            {showSubcategories && (
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
            {showConfirmation && (
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
      {status === "adding" && (
        <LoadingMessage message="Adding the new category" />
      )}
      {status === "error" && <ErrorMessage />}
    </Modal>
  );
};

export default AddCategoryModal;
