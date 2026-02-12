import LoadingMessage from "@/components/layout/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext, useState } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import ErrorMessage from "@/components/layout/errorMessage";
import centsToDollars from "@/helpers/centsToDollars";
import CategoryDetailsForm from "@/components/category/categoryDetailsForm";
import AddSubcategoryForm from "@/components/category/addSubcategoryForm";
import CategoryConfirmationPage from "@/components/category/categoryConfirmationPage";
import PreviousCategoryForm from "./previousCategoryForm";

const AddCategoryModal = ({ dateInfo, modal, setModal }) => {
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

  const { postCategory, getCategories } = useContext(CategoriesContext);
  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [status, setStatus] = useState("inputting");
  const [modalPage, setModalPage] = useState("question");

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
    setModal("none");
  };

  const addNewCategory = async () => {
    setStatus("posting");

    try {
      await postCategory(newCategory);

      // Fetch the updated categories to show changes to the Fun Money category's budget
      await getCategories(dateInfo.month, dateInfo.year);

      closeModal();
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    }
  };

  return (
    <Modal show={modal === "add"} onHide={closeModal} centered>
      {status === "inputting" && (
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
              />
            )}
            {modalPage === "confirm" && (
              <CategoryConfirmationPage newCategory={newCategory} />
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
