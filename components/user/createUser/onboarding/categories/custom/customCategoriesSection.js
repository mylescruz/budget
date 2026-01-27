import PopUp from "@/components/layout/popUp";
import { useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import SubcategoriesPage from "./subcategoriesPage";
import ConfirmationPage from "./confirmationPage";
import dollarFormatter from "@/helpers/dollarFormatter";
import centsToDollars from "@/helpers/centsToDollars";
import CategoryDetailsForm from "@/components/category/categoryDetailsForm";

const CustomCategoriesSection = ({ newUser, setNewUser, moveToIncome }) => {
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

  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [formPage, setFormPage] = useState("details");

  // Functions to navigate adding a category
  const confirmDetails = () => {
    if (newCategory.hasSubcategory) {
      setFormPage("subcategories");
    } else {
      setNewCategory({
        ...newCategory,
        budget: parseFloat(newCategory.budget),
      });
      setFormPage("confirm");
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

    setFormPage("confirm");
  };

  const backToDetails = () => {
    setFormPage("details");
  };

  const backFromConfirm = () => {
    if (newCategory.hasSubcategory) {
      setFormPage("subcategories");
    } else {
      setFormPage("details");
    }
  };

  // Update the new categories array with the custom categories inputted
  const addNewCategory = (e) => {
    e.preventDefault();

    setNewUser({
      ...newUser,
      categories: [...newUser.categories, newCategory],
    });

    setNewCategory(emptyCategory);

    setFormPage("details");
  };

  return (
    <Row className="my-2 mx-auto">
      <Col className="col-12 col-md-7 mb-4">
        <Card className="card-background px-3 py-3">
          <Form onSubmit={addNewCategory}>
            {formPage === "details" && (
              <CategoryDetailsForm
                newCategory={newCategory}
                setNewCategory={setNewCategory}
              />
            )}
            {formPage === "subcategories" && (
              <SubcategoriesPage
                newCategory={newCategory}
                setNewCategory={setNewCategory}
              />
            )}
            {formPage === "confirm" && (
              <ConfirmationPage newCategory={newCategory} />
            )}
            {formPage === "details" && (
              <div className="float-end">
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
            {formPage === "subcategories" && (
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
            {formPage === "confirm" && (
              <div className="w-100 d-flex justify-content-between">
                <Button variant="secondary" onClick={backFromConfirm}>
                  Back
                </Button>
                <Button variant="primary" type="submit">
                  Add
                </Button>
              </div>
            )}
          </Form>
        </Card>
      </Col>
      <Col className="col-12 col-md-5">
        <Card className="card-background px-2 py-3">
          <h6 className="text-center mt-4 mt-md-0">
            Categories Entered
            <PopUp
              title="You can always add more or edit categories later!"
              id="custom-categories-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </h6>
          <Table borderless className="mx-auto">
            <thead>
              <tr className="d-flex">
                <th className="col-8 gray-background">Category</th>
                <th className="col-4 text-end gray-background">Budget</th>
              </tr>
            </thead>
            <tbody>
              {newUser.categories.map((category, index) => (
                <tr key={index} className="d-flex">
                  <td className="col-8 gray-background">
                    {category.name}
                    {category.name === "Fun Money" && (
                      <PopUp
                        title="The money you can spend on whatever you want after all other expenses have been covered. Includes food, entertainment, travel, etc."
                        id="fun-money-info"
                      >
                        <span> &#9432;</span>
                      </PopUp>
                    )}
                  </td>
                  <td className="col-4 text-end gray-background">
                    {dollarFormatter(category.budget)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {newUser.categories.length > 0 && (
            <div className="text-end">
              <Button onClick={moveToIncome}>Done</Button>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default CustomCategoriesSection;
