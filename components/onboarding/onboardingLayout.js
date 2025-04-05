import { Card, Col, Row } from "react-bootstrap";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import OnboardingCategories from "./onboardingCategories";
import OnboardingIncome from "./onboardingIncome";
import OnboardingComplete from "./onboardingComplete";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import { CategoriesContext, CategoriesProvider } from "@/contexts/CategoriesContext";
import useIncome from "@/hooks/useIncome";
import { useSession } from "next-auth/react";
import useUser from "@/hooks/useUser";

const OnboardingInnerLayout = () => {
    const { data: session } = useSession();
    const { user, putUser } = useUser();
    const { putCategories } = useContext(CategoriesContext);
    const { postIncome } = useIncome(session.user.username, dateInfo.currentYear);
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
            newIncome.map(paycheck => {
                postIncome(paycheck);
            });
        } catch(error) {
            console.error("Error adding the new user's income during onboarding: ", error);
        }

        // If a user entered custom categories, use a PUT request to update the categories
        // If the user chooses the default categories, those will load automatically
        if (customChosen) {
            try {
                putCategories(newCategories);
            } catch(error) {
                console.error("Error adding the new user's custom categories during onboarding: ", error);
            }
        }

        // Update the user's info to show that they are now onboared
        try {
            putUser(user);
            session.user.onboarded = true;
        } catch(error) {
            console.error("Error updating the user to be onboarded", error);
            window.alert("Sorry there was an error onboarding you. Please try again!");
            router.push('/onboarding');
        }

        // Take user to their new budget
        router.push('/budget');
    };

    const onboardingCategoriesProps = {
        newCategories: newCategories,
        setNewCategories: setNewCategories,
        categoryQuestion: categoryQuestion,
        defaultCategory: defaultCategory,
        customCategory: customCategory,
        moveToIncome: moveToIncome,
        enterCustom: enterCustom
    };

    return (
        <>
            <h2 className="text-center">Welcome to Type-A Budget!</h2>

            <Card className="col-10 col-lg-6 mx-auto my-4 p-2 card-background">
                {chooseCategory && <OnboardingCategories {...onboardingCategoriesProps} />}
                {chooseIncome && <OnboardingIncome newIncome={newIncome} setNewIncome={setNewIncome} openComplete={openComplete} />}
                {completeOnboarding && <OnboardingComplete setBudget={setBudget} />}

                <Row className="mx-auto my-2">
                    <Col>{chooseCategory ? <span>&#9679;</span> : <span>&#9675;</span>}</Col>
                    <Col>{chooseIncome ? <span>&#9679;</span> : <span>&#9675;</span>}</Col>
                    <Col>{completeOnboarding ? <span>&#9679;</span> : <span>&#9675;</span>}</Col>
                </Row>
            </Card>
        </>
    );
};

const OnboardingLayout = () => {
    const month = dateInfo.currentMonth;
    const year = dateInfo.currentYear;
    const monthInfo = getMonthInfo(month, year);

    return (
        <CategoriesProvider monthInfo={monthInfo} >
            <OnboardingInnerLayout monthInfo={monthInfo} />
        </CategoriesProvider>
    );
};

export default OnboardingLayout;