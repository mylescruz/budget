import useBudgetMonths from "@/hooks/useBudgetMonths";
import { Button, Col, Dropdown, Row } from "react-bootstrap";
import LoadingIndicator from "./loadingIndicator";
import getDateInfo from "@/helpers/getDateInfo";
import styles from "@/styles/ui/budgetMonthSwitcher.module.css";

const MONTHS_MAP = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

const BudgetMonthSwitcher = ({
  monthInfo,
  setMonthInfo,
  pageInfo,
  children,
}) => {
  const { budgetMonths, budgetMonthsLoading } = useBudgetMonths();

  // Allow a user to choose a month from the dropdown
  const chooseBudget = (monthNum, monthYear) => {
    const date = new Date(`${monthNum}/01/${monthYear}`);
    const info = getDateInfo(date);

    setMonthInfo(info);
  };

  // Function to move one month back
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

  // Function to move one month forward
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
          <Col className="col-2 col-lg-1">
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
          <Col className="col-8 col-lg-10 px-0">
            <div className="d-flex justify-content-center align-items-center">
              <h1 className={styles.title}>{pageInfo.title}</h1>
              <Dropdown className="mx-2 mx-md-3 mx-lg-3">
                <Dropdown.Toggle variant="dark" size="sm" />
                <Dropdown.Menu className={styles.menu}>
                  {budgetMonths.months.map((month) => (
                    <div key={`${month.month}/${month.year}`}>
                      <Dropdown.Item
                        className={
                          monthInfo.month === month.month &&
                          monthInfo.year === month.year
                            ? "bg-primary text-white"
                            : ""
                        }
                        onClick={() => chooseBudget(month.month, month.year)}
                      >
                        {`${MONTHS_MAP[month.month]} ${month.year}`}
                      </Dropdown.Item>
                      {MONTHS_MAP[month.month] === "January" && (
                        <hr className="my-1" />
                      )}
                    </div>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
          <Col className="col-2 col-lg-1">
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
