import usePreviousCategories from "@/hooks/usePreviousCategories";
import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

const PreviousCategoryForm = ({ dateInfo, setNewCategory, setModalPage }) => {
  const { previousCategories, previousCategoriesLoading } =
    usePreviousCategories(dateInfo.month, dateInfo.year);

  const [chosenCategory, setChosenCategory] = useState("");

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

    setNewCategory((prev) => ({
      ...prev,
      name: foundCategory.name,
      color: foundCategory.color,
    }));

    setModalPage("details");
  };

  if (previousCategoriesLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Spinner variant="primary" />
      </div>
    );
  } else if (!previousCategories) {
    return (
      <div className="text-center">
        <h5>Sorry we couldn't get your previous categories right now!</h5>
        <p>You can recreate the category here</p>
        <Button variant="primary" className="my-2" onClick={openDetailsPage}>
          Create New
        </Button>
      </div>
    );
  } else {
    return (
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
    );
  }
};

export default PreviousCategoryForm;
