import AddPaycheckModal from "./addPaycheckModal";
import { Button, Col, Row } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import Loading from "../layout/loading";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import {
  PaychecksContext,
  PaychecksProvider,
} from "@/contexts/PaychecksContext";
import {
  MonthIncomeProvider,
  MonthIncomeContext,
} from "@/contexts/MonthIncomeContext";
import PaychecksTable from "./paychecksTable";

const InnerIncomeLayout = ({ dateInfo }) => {
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

  const addPay = () => {
    setAddPaycheckClicked(true);
  };

  const AddPaycheckModalProps = {
    dateInfo: dateInfo,
    addPaycheckClicked: addPaycheckClicked,
    setAddPaycheckClicked: setAddPaycheckClicked,
  };

  if (paychecksLoading || monthIncomeLoading) {
    return <Loading />;
  } else {
    return (
      <>
        <aside className="info-text text-center mx-auto">
          <h1>{dateInfo.year} Income</h1>
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
            <PaychecksTable dateInfo={dateInfo} />
          </Col>
        </Row>

        {addPaycheckClicked && <AddPaycheckModal {...AddPaycheckModalProps} />}
      </>
    );
  }
};

const IncomeLayout = ({ dateInfo }) => {
  return (
    <CategoriesProvider dateInfo={dateInfo}>
      <PaychecksProvider dateInfo={dateInfo}>
        <MonthIncomeProvider dateInfo={dateInfo}>
          <InnerIncomeLayout dateInfo={dateInfo} />
        </MonthIncomeProvider>
      </PaychecksProvider>
    </CategoriesProvider>
  );
};

export default IncomeLayout;
