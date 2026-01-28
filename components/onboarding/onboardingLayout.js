import { Col, Container, Modal, Row, Spinner } from "react-bootstrap";
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
  const [screen, setScreen] = useState("categories");
  const [categoryQuestion, setCategoryQuestion] = useState(true);
  const [enterCustom, setEnterCustom] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [modal, setModal] = useState("none");

  const router = useRouter();

  const today = new Date();
  const dateInfo = getDateInfo(today);

  // Functions to change screens in boarding
  const openIncome = () => {
    setScreen("income");
  };

  const openComplete = () => {
    setScreen("complete");
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

  const closeLoadingModal = () => {
    setModal("none");
  };

  // Complete the onboarding by adding all the user's details to MongoDB
  const finishOnboarding = async () => {
    setModal("loading");

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
    } finally {
      setModal("none");
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
        {screen === "categories" && (
          <CategoriesSection {...categoriesSectionProps} />
        )}
        {screen === "income" && <IncomeSection {...incomeSectionProps} />}
        {screen === "complete" && (
          <CompleteSection finishOnboarding={finishOnboarding} />
        )}

        <Row className="col-6 mx-auto text-center my-2">
          <Col>
            {screen === "categories" ? (
              <span>&#9679;</span>
            ) : (
              <span>&#9675;</span>
            )}
          </Col>
          <Col>
            {screen === "income" ? <span>&#9679;</span> : <span>&#9675;</span>}
          </Col>
          <Col>
            {screen === "complete" ? (
              <span>&#9679;</span>
            ) : (
              <span>&#9675;</span>
            )}
          </Col>
        </Row>
      </Container>

      <Modal show={modal === "loading"} onHide={closeLoadingModal} centered>
        <Modal.Body className="text-center">
          <h3>Loading your new budget!</h3>
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" variant="primary" />
          </div>
        </Modal.Body>
      </Modal>

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
