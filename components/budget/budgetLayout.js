import { useContext, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import {
  CategoriesContext,
  CategoriesProvider,
} from "@/contexts/CategoriesContext";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import TransactionsLayout from "./transactions/transactionsLayout";
import {
  TransactionsContext,
  TransactionsProvider,
} from "@/contexts/TransactionsContext";
import LoadingIndicator from "../layout/loadingIndicator";
import TotalsLayout from "./totals/totalsLayout";
import CategoryTableLayout from "./categoryTableLayout/categoryTableLayout";
import useBudgetMonths from "@/hooks/useBudgetMonths";
import getDateInfo from "@/helpers/getDateInfo";

const InnerBudgetLayout = ({ dateInfo }) => {
  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const { transactionsLoading } = useContext(TransactionsContext);

  if (categoriesLoading || transactionsLoading) {
    return <LoadingIndicator />;
  } else if (!categories) {
    return (
      <Row className="mt-4 text-center">
        <p className="fw-bold text-danger">
          &#9432; There was an error loading your budget. Please try again
          later!
        </p>
      </Row>
    );
  } else {
    return (
      <Container className="w-100">
        <Row className="d-flex justify-content-center">
          <Col className="col-12 col-xl-10">
            <TotalsLayout />
          </Col>
        </Row>

        <Row className="d-flex flex-column flex-lg-row align-items-center">
          <Col className="col-12 col-xl-4">
            <CategoryPieChart categories={categories} />
          </Col>
          <Col className="col-12 col-xl-8">
            <CategoryTableLayout dateInfo={dateInfo} />
          </Col>
        </Row>

        <TransactionsLayout dateInfo={dateInfo} />
      </Container>
    );
  }
};

const BudgetLayout = ({ dateInfo }) => {
  const [monthInfo, setMonthInfo] = useState(dateInfo);

  const { budgetMonths, budgetMonthsLoading } = useBudgetMonths();

  const nextMonth = () => {
    let monthNum = monthInfo.month + 1;
    let yearNum = monthInfo.year;

    if (monthNum > 12) {
      monthNum = 1;
      yearNum += 1;
    }

    const date = new Date(`${monthNum}/01/${yearNum}`);
    const info = getDateInfo(date);

    setMonthInfo(info);
  };

  const previousMonth = () => {
    let monthNum = monthInfo.month - 1;
    let yearNum = monthInfo.year;

    if (monthNum === 0) {
      monthNum = 12;
      yearNum -= 1;
    }

    const date = new Date(`${monthNum}/01/${yearNum}`);
    const info = getDateInfo(date);

    setMonthInfo(info);
  };

  if (budgetMonthsLoading) {
    return <LoadingIndicator />;
  } else if (!budgetMonths) {
    return (
      <Row className="mt-4 text-center">
        <p className="fw-bold text-danger">
          &#9432; There was an error loading your budget months. Please try
          again later!
        </p>
      </Row>
    );
  } else {
    return (
      <CategoriesProvider dateInfo={monthInfo}>
        <TransactionsProvider dateInfo={monthInfo}>
          <div className="mx-auto">
            <Row className="d-flex col-12 col-md-8 col-lg-6 col-xl-5 justify-items-between mx-auto align-items-center text-center">
              <Col className="col-2">
                <Button
                  onClick={previousMonth}
                  size="sm"
                  className="btn-dark fw-bold"
                  disabled={
                    budgetMonths.current.month === budgetMonths.min.month &&
                    budgetMonths.current.year === budgetMonths.min.year
                  }
                >
                  &#60;
                </Button>
              </Col>
              <Col className="col-8">
                <h1 className="p-0 m-0 fw-bold">
                  {monthInfo.monthName} {monthInfo.year}
                </h1>
              </Col>
              <Col className="col-2">
                <Button
                  onClick={nextMonth}
                  size="sm"
                  className="btn-dark fw-bold"
                  disabled={
                    budgetMonths.current.month === budgetMonths.max.month &&
                    budgetMonths.current.year === budgetMonths.max.year
                  }
                >
                  &#62;
                </Button>
              </Col>
            </Row>
            <Container className="my-2 mx-auto text-center">
              <p className="fs-6">
                Set your budget for your fixed and changing expenses. Log all
                your transactions made this month. See how much you spent based
                on the category.
              </p>
            </Container>

            <InnerBudgetLayout dateInfo={monthInfo} />
          </div>
        </TransactionsProvider>
      </CategoriesProvider>
    );
  }
};

export default BudgetLayout;
