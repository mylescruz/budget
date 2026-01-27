import { Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import ErrorModal from "@/components/layout/errorModal";
import IncomeSection from "./incomeSection";
import CategoriesSection from "./categories/categoriesSection";
import CompleteSection from "./completeSection";
import { v4 as uuidv4 } from "uuid";
import getDateInfo from "@/helpers/getDateInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

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

const InnerOnboardingLayout = ({ newUser, setNewUser, update }) => {
  // State variables to change screens
  const [categoryQuestion, setCategoryQuestion] = useState(true);
  const [chooseCategory, setChooseCategory] = useState(true);
  const [chooseIncome, setChooseIncome] = useState(false);
  const [completeOnboarding, setCompleteOnboarding] = useState(false);
  const [enterCustom, setEnterCustom] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const router = useRouter();

  const today = new Date();
  const dateInfo = getDateInfo(today);

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
    setNewUser({
      ...newUser,
      customCategories: true,
      categories: [...newUser.categories, funMoneyCategory],
    });
    setEnterCustom(true);
  };

  const moveToIncome = () => {
    setEnterCustom(false);
    openIncome();
  };

  // Complete the onboarding by adding all the user's details to MongoDB
  const finishOnboarding = async () => {
    // Add all the users information in the onboarding API endpoint
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      setErrorOccurred(false);

      await update({ onboarded: true });

      router.push("/");
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    }
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
    dateInfo: dateInfo,
    newUser: newUser,
    setNewUser: setNewUser,
    openComplete: openComplete,
  };

  return (
    <>
      <h2 className="text-center">Welcome to Type-A Budget!</h2>

      <Container className="mx-auto my-4">
        {chooseCategory && <CategoriesSection {...categoriesSectionProps} />}
        {chooseIncome && <IncomeSection {...incomeSectionProps} />}
        {completeOnboarding && (
          <CompleteSection finishOnboarding={finishOnboarding} />
        )}

        <Row className="col-6 mx-auto text-center my-2">
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
      </Container>

      <ErrorModal
        errorOccurred={errorOccurred}
        setErrorOccurred={setErrorOccurred}
      />
    </>
  );
};

const OnboardingLayout = () => {
  const { data: session, update } = useSession();
  const [newUser, setNewUser] = useState({
    username: session.user.username,
    categories: [],
    customCategories: false,
    income: [],
  });

  return (
    <InnerOnboardingLayout
      newUser={newUser}
      setNewUser={setNewUser}
      update={update}
    />
  );
};

export default OnboardingLayout;
