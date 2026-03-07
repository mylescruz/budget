import useBudgetMonths from "@/hooks/useBudgetMonths";
import { Button, Col, Row } from "react-bootstrap";
import LoadingIndicator from "./loadingIndicator";
import getDateInfo from "@/helpers/getDateInfo";

const BudgetMonthSwitcher = ({
  monthInfo,
  setMonthInfo,
  pageInfo,
  children,
}) => {
  const { budgetMonths, budgetMonthsLoading } = useBudgetMonths();

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
      <div className="mx-auto">
        <Row className="d-flex col-12 col-md-8 col-lg-6 col-xl-5 justify-items-between mx-auto align-items-center text-center">
          <Col className="col-2">
            <Button
              onClick={previousMonth}
              size="sm"
              className="btn-dark fw-bold"
              disabled={
                monthInfo.month === budgetMonths.min.month &&
                monthInfo.year === budgetMonths.min.year
              }
            >
              &#60;
            </Button>
          </Col>
          <Col className="col-8">
            <h1 className="p-0 m-0 fw-bold">{pageInfo.title}</h1>
          </Col>
          <Col className="col-2">
            <Button
              onClick={nextMonth}
              size="sm"
              className="btn-dark fw-bold"
              disabled={
                monthInfo.month === budgetMonths.max.month &&
                monthInfo.year === budgetMonths.max.year
              }
            >
              &#62;
            </Button>
          </Col>
        </Row>
        <p className="my-2 mx-4 text-center">{pageInfo.description}</p>

        <div className="mt-4">{children}</div>
      </div>
    );
  }
};

export default BudgetMonthSwitcher;
