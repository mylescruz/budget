import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import PopUp from "@/components/layout/popUp";
import { useState } from "react";
import currencyFormatter from "@/helpers/currencyFormatter";
import { v4 as uuidv4 } from "uuid";

const defaultExampleCategories = [
  {
    name: "Rent",
    budget: "$2000",
  },
  {
    name: "Savings",
    budget: "$5000",
  },
  {
    name: "Insurance",
    budget: "$500",
  },
  {
    name: "Internet/TV",
    budget: "$100",
  },
  {
    name: "Subscriptions",
    budget: "$50",
  },
];

const customExampleCategories = [
  {
    name: "Mortgage",
    budget: "$1850",
  },
  {
    name: "Student Loans",
    budget: "$352",
  },
  {
    name: "Spectrum Bill",
    budget: "$89",
  },
  {
    name: "Disney Plus",
    budget: "$14.99",
  },
  {
    name: "Travel",
    budget: "$500",
  },
];

const CategoriesSection = ({
  newUser,
  setNewUser,
  categoryQuestion,
  defaultCategory,
  customCategory,
  moveToIncome,
  enterCustom,
}) => {
  const emptyCategory = {
    name: "",
    color: "#000000",
    budget: "",
    actual: 0,
    fixed: false,
    hasSubcategory: false,
    subcategories: [],
  };

  const emptySubcategory = {
    id: uuidv4(),
    name: "",
    actual: 0,
  };

  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);
  const [subcategoryTotal, setSubcategoryTotal] = useState(0);

  // Functions to set the input when adding a new category
  const handleInput = (e) => {
    setNewCategory({ ...newCategory, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input == "") {
      setNewCategory({ ...newCategory, budget: input });
    } else {
      setNewCategory({ ...newCategory, budget: parseFloat(input) });
    }
  };

  const handleSubcategoryInput = (e) => {
    setNewSubcategory({ ...newSubcategory, name: e.target.value });
  };

  const handleSubcategoryBudget = (e) => {
    const input = e.target.value;

    if (input == "") {
      setNewSubcategory({ ...newSubcategory, actual: input });
    } else {
      setNewSubcategory({ ...newSubcategory, actual: parseFloat(input) });
    }
  };

  const handleSubcategoryChecked = (e) => {
    if (e.target.checked) {
      setNewCategory({ ...newCategory, hasSubcategory: true });
    } else {
      setNewCategory({
        ...newCategory,
        hasSubcategory: false,
        subcategories: [],
      });
    }
  };

  const handleFixed = (e) => {
    if (e.target.checked) {
      setNewCategory({ ...newCategory, fixed: true });
    } else {
      setNewCategory({ ...newCategory, fixed: false });
    }
  };

  // Function add to the subcategories to the new category
  const addToSubcategories = () => {
    setSubcategoryTotal(
      parseFloat((subcategoryTotal + newSubcategory.actual).toFixed(2))
    );

    if (newCategory.fixed) {
      // If the new category is fixed, set the budget and actual equal to the subcategory total and add the subcategory to the array
      setNewCategory({
        ...newCategory,
        budget: parseFloat(
          (subcategoryTotal + newSubcategory.actual).toFixed(2)
        ),
        actual: parseFloat(
          (subcategoryTotal + newSubcategory.actual).toFixed(2)
        ),
        hasSubcategory: true,
        subcategories: [...newCategory.subcategories, newSubcategory],
      });
    } else {
      // If the new category is not fixed, just add the subcategory to the array
      setNewCategory({
        ...newCategory,
        hasSubcategory: true,
        subcategories: [...newCategory.subcategories, newSubcategory],
      });
    }

    setNewSubcategory(emptySubcategory);
  };

  // Update the new categories array with the custom categories inputted
  const addNewCategory = (e) => {
    e.preventDefault();

    // A fixed category's budget and actual spent are the same
    if (!newCategory.hasSubcategory && newCategory.fixed) {
      newCategory.actual = newCategory.budget;
    }

    setNewUser({
      ...newUser,
      categories: [...newUser.categories, newCategory],
    });

    setNewCategory(emptyCategory);
  };

  return (
    <>
      <h4 className="text-center">Let&#39;s start creating your budget!</h4>

      {categoryQuestion && (
        <>
          <p className="text-center mb-4">
            Do you want to use our default categories or customize your own?
            <PopUp
              title="You can always edit these categories later!"
              id="categories-question"
            >
              <span> &#9432;</span>
            </PopUp>
          </p>

          <Row>
            <Col className="col-12 col-md-6 col-lg-6 mb-4">
              <h5 className="text-center">Default</h5>
              <Table borderless className="w-75 mx-auto">
                <tbody>
                  {defaultExampleCategories.map((category, index) => (
                    <tr key={index}>
                      <td className="gray-background">{category.name}</td>
                      <td className="gray-background">{category.budget}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="gray-background">And more...</td>
                    <td className="gray-background" />
                  </tr>
                </tbody>
              </Table>
              <div className="text-center">
                <Button variant="secondary" onClick={defaultCategory}>
                  Default
                </Button>
              </div>
            </Col>
            <Col className="col-12 col-md-6 col-lg-6 mb-4">
              <h5 className="text-center">
                Custom
                <PopUp
                  title="These are just examples, you can make your own"
                  id="custom-categories-question"
                >
                  <span> &#9432;</span>
                </PopUp>
              </h5>
              <Table borderless className="w-75 mx-auto">
                <tbody>
                  {customExampleCategories.map((category, index) => (
                    <tr key={index}>
                      <td className="gray-background">{category.name}</td>
                      <td className="gray-background">{category.budget}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="gray-background">And more...</td>
                    <td className="gray-background" />
                  </tr>
                </tbody>
              </Table>
              <div className="text-center">
                <Button variant="primary" onClick={customCategory}>
                  Custom
                </Button>
              </div>
            </Col>
          </Row>
        </>
      )}

      {enterCustom && (
        <Row className="col-12 my-2 mx-auto">
          <Col className="col-12 col-md-6">
            <Form onSubmit={addNewCategory}>
              <Form.Group controlId="name" className="my-2">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  className="h-100"
                  type="text"
                  value={newCategory.name}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group controlId="budget" className="my-2">
                <Form.Label>Budget Amount</Form.Label>
                <Form.Control
                  className="h-100"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    newCategory.hasSubcategory && newCategory.fixed
                      ? subcategoryTotal
                      : newCategory.budget
                  }
                  onChange={handleNumInput}
                  disabled={newCategory.hasSubcategory && newCategory.fixed}
                  required
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group controlId="color" className="my-2">
                    <Form.Label>Color</Form.Label>
                    <Form.Control
                      type="color"
                      className="form-control-color"
                      value={newCategory.color}
                      onChange={handleInput}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="fixed" className="my-2">
                    <Form.Label>Fixed?</Form.Label>
                    <Form.Check
                      className="h-100"
                      type="checkbox"
                      value={newCategory.fixed}
                      onChange={handleFixed}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="hasSubcategory" className="my-2">
                    <Form.Label>Subcategories?</Form.Label>
                    <Form.Check
                      className="h-100"
                      type="checkbox"
                      value={newCategory.hasSubcategory}
                      onChange={handleSubcategoryChecked}
                    />
                  </Form.Group>
                </Col>
              </Row>
              {newCategory.hasSubcategory && (
                <Form.Group className="my-2">
                  <Row>
                    <Col className="col-5">
                      <Form.Group controlId="subcategory-name" className="my-2">
                        <Form.Label>Subcategory Name</Form.Label>
                        <Form.Control
                          className="h-100"
                          type="text"
                          value={newSubcategory.name}
                          onChange={handleSubcategoryInput}
                        />
                      </Form.Group>
                    </Col>
                    {newCategory.hasSubcategory && newCategory.fixed && (
                      <Col className="col-5">
                        <Form.Group
                          controlId="subcategory-budget"
                          className="my-2"
                        >
                          <Form.Label>Subcategory Budget</Form.Label>
                          <Form.Control
                            className="h-100"
                            type="number"
                            value={newSubcategory.actual}
                            onChange={handleSubcategoryBudget}
                          />
                        </Form.Group>
                      </Col>
                    )}
                    <Col className="col-2 d-flex align-items-center">
                      <i
                        className="bi bi-plus-circle plus"
                        onClick={addToSubcategories}
                      ></i>
                    </Col>
                  </Row>
                </Form.Group>
              )}
              {newCategory.hasSubcategory && (
                <Container>
                  {newCategory.subcategories.length > 0 && (
                    <h6>Subcategories added</h6>
                  )}
                  {newCategory.subcategories.map((subcategory) => (
                    <p key={subcategory.id} className="my-1">
                      {subcategory.name}
                      {newCategory.fixed &&
                        `: ${currencyFormatter.format(subcategory.actual)}`}
                    </p>
                  ))}
                </Container>
              )}
              <Row className="text-end my-2 mx-auto w-100">
                <Button variant="primary" type="submit">
                  Add Category
                </Button>
              </Row>
            </Form>
          </Col>
          <Col className="col-12 col-md-6">
            <h6 className="text-center mt-4 mt-md-0">
              Categories Entered
              <PopUp
                title="You can always add more categories later!"
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
                    <td className="col-8 gray-background">{category.name}</td>
                    <td className="col-4 text-end gray-background">
                      {currencyFormatter.format(category.budget)}
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
          </Col>
        </Row>
      )}
    </>
  );
};

export default CategoriesSection;
