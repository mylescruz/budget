import { Container } from "react-bootstrap";
import CustomCategoriesSection from "./customCategoriesSection";
import { useState } from "react";
import ChooseCategoriesType from "./chooseCategoriesType";

const CategoriesSection = ({ newUser, setNewUser, moveToIncome }) => {
  const funMoneyCategory = {
    name: "Fun Money",
    color: "#6cc17a",
    budget: 500,
    fixed: false,
    subcategories: [
      { name: "Food" },
      { name: "Entertainment" },
      { name: "Miscellaneous" },
      { name: "Family & Friends" },
      { name: "Travel" },
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
