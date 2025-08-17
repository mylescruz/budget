import { Card, Col, Row } from "react-bootstrap";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import OnboardingCategoriesSection from "./onboardingCategoriesSection";
import OnboardingIncomeSection from "./onboardingIncomeSection";
import OnboardingCompleteSection from "./onboardingCompleteSection";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import {
  CategoriesContext,
  CategoriesProvider,
} from "@/contexts/CategoriesContext";
import { useSession } from "next-auth/react";
import useUser from "@/hooks/useUser";
import ErrorModal from "../layout/errorModal";
import { IncomeContext, IncomeProvider } from "@/contexts/IncomeContext";

const OnboardingInnerLayout = () => {
  const { data: session } = useSession();
  const { user, putUser } = useUser();
  const { updateCategories } = useContext(CategoriesContext);
  const { postIncome } = useContext(IncomeContext);
  const router = useRouter();

  // The new user's income and categories objects
  const [newCategories, setNewCategories] = useState([]);
  const [newIncome, setNewIncome] = useState([]);

  // State variables to change screens
  const [categoryQuestion, setCategoryQuestion] = useState(true);
  const [chooseCategory, setChooseCategory] = useState(true);
  const [chooseIncome, setChooseIncome] = useState(false);
  const [completeOnboarding, setCompleteOnboarding] = useState(false);
  const [customChosen, setCustomChosen] = useState(false);
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
    setCustomChosen(true);
    setEnterCustom(true);
  };

  const moveToIncome = () => {
    setEnterCustom(false);
    openIncome();
  };

  // Function to set the final budget using the inputted categories and income
  const setBudget = async () => {
    // Add the user's paychecks to their income
    try {
      newIncome.forEach((paycheck) => {
        postIncome(paycheck);
      });

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(
        "Error adding the new user's income during onboarding: ",
        error
      );
      return;
    }

    // If a user entered custom categories, use a PUT request to update the categories
    // If the user chooses the default categories, those will load automatically
    if (customChosen) {
      try {
        updateCategories(newCategories);

        setErrorOccurred(false);
      } catch (error) {
        setErrorOccurred(true);
        console.error(
          "Error adding the new user's custom categories during onboarding: ",
          error
        );
        return;
      }
    }

    // Update the user's info to show that they are now onboared
    try {
      putUser(user);
      session.user.onboarded = true;

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error("Error updating the user to be onboarded", error);
      return;
    }

    // Take user to their new budget
    router.push("/budget");
  };

  const onboardingCategoriesProps = {
    newCategories: newCategories,
    setNewCategories: setNewCategories,
    categoryQuestion: categoryQuestion,
    defaultCategory: defaultCategory,
    customCategory: customCategory,
    moveToIncome: moveToIncome,
    enterCustom: enterCustom,
  };

  return (
    <>
      <h2 className="text-center">Welcome to Type-A Budget!</h2>

      <Card className="col-10 col-lg-6 mx-auto my-4 p-2 card-background">
        {chooseCategory && (
          <OnboardingCategoriesSection {...onboardingCategoriesProps} />
        )}
        {chooseIncome && (
          <OnboardingIncomeSection
            newIncome={newIncome}
            setNewIncome={setNewIncome}
            openComplete={openComplete}
          />
        )}
        {completeOnboarding && (
          <OnboardingCompleteSection setBudget={setBudget} />
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

const OnboardingLayout = () => {
  const month = dateInfo.currentMonth;
  const year = dateInfo.currentYear;
  const monthInfo = getMonthInfo(month, year);

  return (
    <CategoriesProvider monthInfo={monthInfo}>
      <IncomeProvider monthInfo={monthInfo}>
        <OnboardingInnerLayout monthInfo={monthInfo} />
      </IncomeProvider>
    </CategoriesProvider>
  );
};

export default OnboardingLayout;
