import IncomeTable from "./incomeTable";
import AddIncomeModal from "./addIncomeModal";
import { Button, Col, Row } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import getYearInfo from "@/helpers/getYearInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "../layout/loading";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import getMonthInfo from "@/helpers/getMonthInfo";
import dateInfo from "@/helpers/dateInfo";
import { IncomeContext, IncomeProvider } from "@/contexts/IncomeContext";

const InnerIncomeLayout = ({ year }) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  // Using the router object to redirect to different pages within the app
  const router = useRouter();

  const { income, incomeLoading } = useContext(IncomeContext);
  const [addPaycheckClicked, setAddPaycheckClicked] = useState(false);
  const [nullIncome, setNullIncome] = useState(income === null);

  // Checks if there is an error loading income
  useEffect(() => {
    if (income) {
      setNullIncome(false);
    } else {
      setNullIncome(true);
    }
  }, [income]);

  const yearInfo = getYearInfo(year);

  const addPay = () => {
    setAddPaycheckClicked(true);
  };

  const AddIncomeModalProps = {
    yearInfo: yearInfo,
    addPaycheckClicked: addPaycheckClicked,
    setAddPaycheckClicked: setAddPaycheckClicked,
  };

  // If there is no user session, redirect to the home page
  if (!session) {
    router.push("/");
  } else if (incomeLoading) {
    // If the income is still being loaded by the API, show the loading component
    return <Loading />;
  } else {
    return (
      <>
        <aside className="info-text text-center mx-auto">
          <h1>{year} Income</h1>
          <p>
            View and add your paychecks for the current year. View your gross
            and net income and see how much taxes have been taken out.
          </p>
        </aside>

        <Row className="text-center">
          <Col>
            <Button
              id="add-paycheck-btn"
              variant="primary"
              onClick={addPay}
              disabled={nullIncome}
            >
              Add Paycheck
            </Button>
          </Col>
        </Row>

        <Row className="d-flex my-4">
          <Col className="col-11 col-md-10 col-xl-8 mx-auto">
            <IncomeTable yearInfo={yearInfo} />
          </Col>
        </Row>

        {addPaycheckClicked && <AddIncomeModal {...AddIncomeModalProps} />}
      </>
    );
  }
};

const IncomeLayout = ({ year }) => {
  const monthInfo = getMonthInfo(dateInfo.currentMonth, year);

  return (
    <CategoriesProvider monthInfo={monthInfo}>
      <IncomeProvider monthInfo={monthInfo}>
        <InnerIncomeLayout year={year} />
      </IncomeProvider>
    </CategoriesProvider>
  );
};

export default IncomeLayout;
