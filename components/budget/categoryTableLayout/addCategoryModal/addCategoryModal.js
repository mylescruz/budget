import LoadingMessage from "@/components/ui/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext, useState } from "react";
import { Button, Modal, Row } from "react-bootstrap";
import centsToDollars from "@/helpers/centsToDollars";
import CategoryDetailsForm from "@/components/category/categoryDetailsForm";
import AddSubcategoryForm from "@/components/category/addSubcategoryForm";
import CategoryConfirmationPage from "@/components/category/categoryConfirmationPage";
import PreviousCategoryForm from "./previousCategoryForm";
import { FIXED_FREQUENCIES } from "@/lib/constants/categories";

const AddCategoryModal = ({ dateInfo, modal, setModal }) => {
  const emptyCategory = {
    name: "",
    color: "#000000",
    budget: "",
    dueDate: "",
    frequency: FIXED_FREQUENCIES.MONTHLY,
    fixed: false,
    hasSubcategory: false,
    subcategories: [],
  };

  const { postCategory, getCategories, categoryNames } =
    useContext(CategoriesContext);
  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [formMeta, setFormMeta] = useState({
    status: "idle",
    error: null,
  });
  const [modalPage, setModalPage] = useState("question");

  // Validate whether the inputted category name has been taken or not
  const validateCategoryName = (categoryName) => {
    let isValid = true;

    if (categoryNames.has(categoryName)) {
      setFormMeta({
        status: "idle",
        error: `There is already a category named ${categoryName}`,
      });

      isValid = false;
    } else {
      categoryNames.add(categoryName);

      setFormMeta({
        status: "idle",
        error: null,
      });
    }

    return isValid;
  };

  const confirmDetails = () => {
    const validName = validateCategoryName(newCategory.name);

    if (!validName) {
      return;
    }

    setFormMeta({ status: "idle", error: null });

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

  const goToDetails = () => {
    setModalPage("details");
  };

  const goToPrevious = () => {
    setModalPage("previous");
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
        const subcategoryBudget = Number(subcategory.budget);

        subcategoryTotal = subcategoryTotal + subcategoryBudget * 100;
        return {
          ...subcategory,
          budget: subcategoryBudget,
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
          return { ...subcategory, budget: 0 };
        }),
      });
    }

    setModalPage("confirm");
  };

  const closeModal = () => {
    setNewCategory(emptyCategory);

    setModalPage("details");
    setFormMeta({ status: "idle", error: null });
    setModal("none");
  };

  const addNewCategory = async () => {
    setFormMeta({ status: "posting", error: null });

    try {
      await postCategory(newCategory);

      closeModal();
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
    }
  };

  return (
    <Modal show={modal === "add"} onHide={closeModal} centered>
      {formMeta.status === "idle" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Add a category</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {modalPage === "question" && (
              <Row className="text-center">
                <h6>
                  Do you want to add a new or a previously created category?
                </h6>
                <Row className="d-flex flex-col text-center mx-auto">
                  <Button
                    variant="primary"
                    className="my-2"
                    onClick={goToDetails}
                  >
                    New
                  </Button>
                  <Button
                    variant="secondary"
                    className="my-2"
                    onClick={goToPrevious}
                  >
                    Previous
                  </Button>
                </Row>
              </Row>
            )}
            {modalPage === "previous" && (
              <PreviousCategoryForm
                dateInfo={dateInfo}
                setNewCategory={setNewCategory}
                setModalPage={setModalPage}
              />
            )}
            {modalPage === "details" && (
              <CategoryDetailsForm
                newCategory={newCategory}
                setNewCategory={setNewCategory}
              />
            )}
            {modalPage === "subcategories" && (
              <AddSubcategoryForm
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                validateCategoryName={validateCategoryName}
              />
            )}
            {modalPage === "confirm" && (
              <CategoryConfirmationPage newCategory={newCategory} />
            )}
            {formMeta.error && (
              <p className="text-danger text-center">{formMeta.error}</p>
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
                    (!newCategory.fixed &&
                      (newCategory.budget === "" ||
                        Number(newCategory.budget) === 0)) ||
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
      {formMeta.status === "posting" && (
        <LoadingMessage message="Adding the new category" />
      )}
    </Modal>
  );
};

export default AddCategoryModal;
