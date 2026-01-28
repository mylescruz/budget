import { Container } from "react-bootstrap";
import CustomCategoriesSection from "./customCategoriesSection";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ChooseCategoriesType from "./chooseCategoriesType";

const CategoriesSection = ({ newUser, setNewUser, moveToIncome }) => {
  const funMoneyCategory = {
    name: "Fun Money",
    color: "#6cc17a",
    budget: 500,
    actual: 0,
    fixed: false,
    subcategories: [
      {
        id: uuidv4(),
        name: "Food",
        actual: 0,
      },
      {
        id: uuidv4(),
        name: "Entertainment",
        actual: 0,
      },
      {
        id: uuidv4(),
        name: "Miscellaneous",
        actual: 0,
      },
      {
        id: uuidv4(),
        name: "Family & Friends",
        actual: 0,
      },
      {
        id: uuidv4(),
        name: "Travel",
        actual: 0,
      },
    ],
  };

  const [categoriesScreen, setCategoriesScreen] = useState("question");

  const openCustomScreen = () => {
    setNewUser({
      ...newUser,
      customCategories: true,
      categories: [...newUser.categories, funMoneyCategory],
    });

    setCategoriesScreen("custom");
  };

  return (
    <Container className="col-12 col-lg-8">
      {categoriesScreen === "question" && (
        <ChooseCategoriesType
          openCustomScreen={openCustomScreen}
          moveToIncome={moveToIncome}
        />
      )}

      {categoriesScreen === "custom" && (
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
