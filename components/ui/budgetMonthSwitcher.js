import useBudgetMonths from "@/hooks/useBudgetMonths";
import { Button, Col, Dropdown, Row } from "react-bootstrap";
import LoadingIndicator from "./loadingIndicator";
import getDateInfo from "@/helpers/getDateInfo";
import styles from "@/styles/ui/budgetMonthSwitcher.module.css";
import ErrorMessage from "./errorMessage";

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
  const { budgetMonths, budgetMonthsRequest } = useBudgetMonths();

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

  const hidePreviousMonth = budgetMonths
    ? monthInfo.month !== budgetMonths.min.month ||
      monthInfo.year !== budgetMonths.min.year
    : false;

  const hideNextMonth = budgetMonths
    ? monthInfo.year !== budgetMonths.max.year ||
      (monthInfo.year === budgetMonths.max.year && monthInfo.month < 12)
    : false;

  if (
    budgetMonthsRequest.action === "get" &&
    budgetMonthsRequest.status === "loading"
  ) {
    return <LoadingIndicator />;
  } else {
    return (
      <>
        <div className="mx-auto">
          {budgetMonths ? (
            <Row className="d-flex col-12 col-md-8 col-lg-6 col-xl-5 justify-items-between mx-auto align-items-center text-center">
              <Col xs={2} lg={1}>
                {hidePreviousMonth && (
                  <i
                    className="bi bi-chevron-left clicker"
                    onClick={previousMonth}
                  />
                )}
              </Col>
              <Col xs={8} lg={10} className="px-0">
                <div className="d-flex justify-content-center align-items-center">
                  <h1 className={styles.title}>{pageInfo.title}</h1>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="light"
                      className="border-0 bg-transparent"
                    />
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
                            onClick={() =>
                              chooseBudget(month.month, month.year)
                            }
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
              <Col xs={8} lg={1}>
                {hideNextMonth && (
                  <i
                    className="bi bi-chevron-right clicker"
                    onClick={nextMonth}
                  />
                )}
              </Col>
            </Row>
          ) : (
            <div className="text-center">
              <h1 className={styles.title}>{pageInfo.title}</h1>
              <ErrorMessage message={budgetMonthsRequest.message} />
            </div>
          )}
          <p className="my-2 mx-4 text-muted small text-center">
            {pageInfo.description}
          </p>

          <div className="mt-4">{children}</div>
        </div>
      </>
    );
  }
};

export default BudgetMonthSwitcher;
