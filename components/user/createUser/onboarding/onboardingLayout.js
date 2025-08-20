import { Card, Col, Row } from "react-bootstrap";
import { useState } from "react";
import ErrorModal from "@/components/layout/errorModal";
import IncomeSection from "./incomeSection";
import CategoriesSection from "./categoriesSection";
import CompleteSection from "./completeSection";

const OnboardingLayout = ({ newUser, setNewUser, finishOnboarding }) => {
  // State variables to change screens
  const [categoryQuestion, setCategoryQuestion] = useState(true);
  const [chooseCategory, setChooseCategory] = useState(true);
  const [chooseIncome, setChooseIncome] = useState(false);
  const [completeOnboarding, setCompleteOnboarding] = useState(false);
  const [enterCustom, setEnterCustom] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  // Functions to change screens in boarding
  const openIncome = () => {
    setChooseCategory(false);
    setChooseIncome(true);
  };

  const openComplete = () => {
    setCompleteOnboarding(true);
    setChooseIncome(false);
  };

  const defaultCategory = () => {
    openIncome();
  };

  const customCategory = () => {
    setCategoryQuestion(false);
    setNewUser({ ...newUser, customCategories: true });
    setEnterCustom(true);
  };

  const moveToIncome = () => {
    setEnterCustom(false);
    openIncome();
  };

  const categoriesSectionProps = {
    newUser: newUser,
    setNewUser: setNewUser,
    categoryQuestion: categoryQuestion,
    defaultCategory: defaultCategory,
    customCategory: customCategory,
    moveToIncome: moveToIncome,
    enterCustom: enterCustom,
  };

  const incomeSectionProps = {
    newUser: newUser,
    setNewUser: setNewUser,
    openComplete: openComplete,
  };

  return (
    <>
      <h2 className="text-center">Welcome to Type-A Budget!</h2>

      <Card className="col-10 col-lg-6 mx-auto my-4 p-2 card-background">
        {chooseCategory && <CategoriesSection {...categoriesSectionProps} />}
        {chooseIncome && <IncomeSection {...incomeSectionProps} />}
        {completeOnboarding && (
          <CompleteSection finishOnboarding={finishOnboarding} />
        )}

        <Row className="mx-auto my-2">
          <Col>
            {chooseCategory ? <span>&#9679;</span> : <span>&#9675;</span>}
          </Col>
          <Col>
            {chooseIncome ? <span>&#9679;</span> : <span>&#9675;</span>}
          </Col>
          <Col>
            {completeOnboarding ? <span>&#9679;</span> : <span>&#9675;</span>}
          </Col>
        </Row>
      </Card>

      <ErrorModal
        errorOccurred={errorOccurred}
        setErrorOccurred={setErrorOccurred}
      />
    </>
  );
};

export default OnboardingLayout;
