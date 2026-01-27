import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import PopUp from "@/components/layout/popUp";
import CustomCategoriesSection from "./customCategoriesSection";

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
    name: "Car Insurance",
    budget: "$250",
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
  return (
    <Container className="col-12 col-lg-8">
      {categoryQuestion && (
        <Card className="card-background px-2 py-3">
          <h4 className="text-center">Let&#39;s start creating your budget!</h4>

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
        </Card>
      )}

      {enterCustom && (
        <CustomCategoriesSection
          newUser={newUser}
          setNewUser={setNewUser}
          moveToIncome={moveToIncome}
        />
      )}
    </Container>
  );
};

export default CategoriesSection;
