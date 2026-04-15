import ErrorMessage from "@/components/ui/errorMessage";
import usePreviousCategories from "@/hooks/usePreviousCategories";
import { FIXED_FREQUENCIES } from "@/lib/constants/categories";
import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

const PreviousCategoryForm = ({ dateInfo, setNewCategory, setModalPage }) => {
  const { previousCategories, previousCategoriesRequest } =
    usePreviousCategories(dateInfo.month, dateInfo.year);

  const [chosenCategory, setChosenCategory] = useState("");

  useEffect(() => {
    if (
      previousCategoriesRequest.status === "success" &&
      previousCategories.length > 0
    ) {
      setChosenCategory(previousCategories[0].name);
    }
  }, [previousCategories, previousCategoriesRequest]);

  const handleInput = (e) => {
    setChosenCategory(e.target.value);
  };

  const backToQuestion = () => {
    setModalPage("question");
  };

  const openDetailsPage = () => {
    setModalPage("details");
  };

  const updateDetails = () => {
    const foundCategory = previousCategories.find(
      (category) => category.name === chosenCategory,
    );

    const formattedCategory = {
      name: foundCategory.name,
      color: foundCategory.color,
      budget: foundCategory.budget,
      actual: foundCategory.actual,
      fixed: foundCategory.fixed,
      dueDate: "",
      frequency: FIXED_FREQUENCIES.MONTHLY,
      hasSubcategory: foundCategory.subcategories.length > 0,
      subcategories: foundCategory.subcategories,
    };

    if (foundCategory.fixed) {
      formattedCategory.dueDate = foundCategory.dueDate;
      formattedCategory.frequency = foundCategory.dueDate;
    }

    setNewCategory(formattedCategory);

    setModalPage("details");
  };

  if (
    previousCategoriesRequest.action === "get" &&
    previousCategoriesRequest.status === "loading"
  ) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <p className="text-center mt-4 fs-6">
          {previousCategoriesRequest.message}
        </p>
      </div>
    );
  } else {
    return (
      <>
        {previousCategories ? (
          previousCategories.length > 0 ? (
            <div>
              <Form.Group controlId="chosenCategory" className="mb-3">
                <Form.Label>Select a previous category</Form.Label>
                <Form.Select value={chosenCategory} onChange={handleInput}>
                  {previousCategories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="mt-4 d-flex flex-row justify-content-between">
                <Button variant="secondary" onClick={backToQuestion}>
                  Back
                </Button>
                <Button variant="primary" onClick={updateDetails}>
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            // No previous categories created that aren't in this budget
            <div className="text-center">
              <p className="mx-2">
                You don't have any previously created categories that are not in
                this month's budget
              </p>
              <Button
                variant="primary"
                className="my-2"
                onClick={openDetailsPage}
              >
                Create New Category
              </Button>
            </div>
          )
        ) : (
          // Displayed when an error occurs fetching the previous categories
          <div className="text-center">
            <ErrorMessage message={previousCategoriesRequest.message} />
            <Button
              variant="primary"
              className="my-2"
              onClick={openDetailsPage}
            >
              Create New Category
            </Button>
          </div>
        )}
      </>
    );
  }
};

export default PreviousCategoryForm;
