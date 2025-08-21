import IncomeTable from "./paychecksTable";
import AddIncomeModal from "./addPaycheckModal";
import { Button, Col, Row } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import getYearInfo from "@/helpers/getYearInfo";
import Loading from "../layout/loading";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import getMonthInfo from "@/helpers/getMonthInfo";
import dateInfo from "@/helpers/dateInfo";
import {
  PaychecksContext,
  PaychecksProvider,
} from "@/contexts/PaychecksContext";
import {
  MonthIncomeProvider,
  MonthIncomeContext,
} from "@/contexts/MonthIncomeContext";

const InnerIncomeLayout = ({ year }) => {
  const { paychecks, paychecksLoading } = useContext(PaychecksContext);
  const { monthIncomeLoading } = useContext(MonthIncomeContext);

  const [addPaycheckClicked, setAddPaycheckClicked] = useState(false);
  const [nullPaychecks, setNullPaychecks] = useState(paychecks === null);

  // Checks if there is an error loading paychecks
  useEffect(() => {
    if (paychecks) {
      setNullPaychecks(false);
    } else {
      setNullPaychecks(true);
    }
  }, [paychecks]);

  const yearInfo = getYearInfo(year);

  const addPay = () => {
    setAddPaycheckClicked(true);
  };

  const AddIncomeModalProps = {
    yearInfo: yearInfo,
    addPaycheckClicked: addPaycheckClicked,
    setAddPaycheckClicked: setAddPaycheckClicked,
  };

  if (paychecksLoading || monthIncomeLoading) {
    return <Loading />;
  } else {
    return (
      <>
        <aside className="info-text text-center mx-auto">
          <h1>{year} Income</h1>
          <p>
            View and add your paychecks for the current year. View your gross
            and net paychecks and see how much taxes have been taken out.
          </p>
        </aside>

        <Row className="text-center">
          <Col>
            <Button
              id="add-paycheck-btn"
              variant="primary"
              onClick={addPay}
              disabled={nullPaychecks}
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
  const monthInfo = getMonthInfo(dateInfo.currentMonthName, year);

  return (
    <CategoriesProvider monthInfo={monthInfo}>
      <PaychecksProvider monthInfo={monthInfo}>
        <MonthIncomeProvider monthInfo={monthInfo}>
          <InnerIncomeLayout year={year} />
        </MonthIncomeProvider>
      </PaychecksProvider>
    </CategoriesProvider>
  );
};

export default IncomeLayout;
