import { Button, Col, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";
import useHistory from "@/hooks/useHistory";
import { useContext, useEffect, useState } from "react";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "../layout/loading";
import {
  MonthIncomeProvider,
  MonthIncomeContext,
} from "@/contexts/MonthIncomeContext";

const InnerHistoryLayout = () => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  // Using the router object to redirect to different pages within the app
  const router = useRouter();

  const { history, historyLoading, postHistory, getMonthHistory } =
    useHistory();
  const { monthIncome, monthIncomeLoading } = useContext(MonthIncomeContext);

  const [currentYearHistory, setCurrentYearHistory] = useState(history);
  const [historyYears, setHistoryYears] = useState({
    years: [],
    current: dateInfo.currentYear,
    max: dateInfo.currentYear,
    min: dateInfo.currentYear,
  });

  // Adds the current month to the history array if not already added
  useEffect(() => {
    const monthInfo = getMonthInfo(dateInfo.currentMonth, dateInfo.currentYear);

    // Sets the new month object and sends the POST request to the API
    const addNewHistoryMonth = async () => {
      const newMonth = {
        month: dateInfo.currentMonth,
        year: dateInfo.currentYear,
        budget: monthIncome,
        actual: 0,
        leftover: monthIncome,
      };

      await postHistory(newMonth);
    };

    // Checks if the current dates' month and year is already history array
    const isMonthInHistory = () => {
      const foundMonth = getMonthHistory(monthInfo);

      return foundMonth !== undefined;
    };

    if (!historyLoading && !isMonthInHistory() && history !== null) {
      addNewHistoryMonth();
    }
  }, [history, historyLoading, postHistory, getMonthHistory, monthIncome]);

  // Get all the years in the history, the max, the min and the current year
  useEffect(() => {
    if (history) {
      const years = new Set(history.map((historyMonth) => historyMonth.year));
      const maxYear = Math.max(...years);
      const minYear = Math.min(...years);

      setHistoryYears({
        years: years,
        current: dateInfo.currentYear,
        max: maxYear,
        min: minYear,
      });
    }
  }, [history]);

  // Filter the history to the current year
  useEffect(() => {
    if (history) {
      const givenYearHistory = history.filter(
        (historyMonth) => historyMonth.year === historyYears.current
      );

      if (historyYears.current === dateInfo.currentYear) {
        const filteredHistory = givenYearHistory.filter(
          (historyMonth) => historyMonth.month !== dateInfo.currentMonth
        );

        setCurrentYearHistory(filteredHistory);
      } else {
        setCurrentYearHistory(givenYearHistory);
      }
    }
  }, [history, historyYears]);

  const nextYear = () => {
    setHistoryYears({ ...historyYears, current: historyYears.current + 1 });
  };

  const previousYear = () => {
    setHistoryYears({ ...historyYears, current: historyYears.current - 1 });
  };

  // If there is no user session, redirect to the home page
  if (!session) {
    router.push("/");
  } else if (historyLoading || monthIncomeLoading) {
    return <Loading />;
  } else {
    return (
      <>
        <aside className="info-text text-center mx-auto">
          <h1>History</h1>
          <p>
            View your budget versus what you actually spent for previous months.
          </p>
        </aside>

        <Row className="d-flex">
          <Col className="col-11 col-md-10 col-xl-8 mx-auto">
            <HistoryTable history={currentYearHistory} />
          </Col>
        </Row>

        <Row className="d-flex text-center">
          <Col className="col-6">
            <Button
              onClick={previousYear}
              disabled={historyYears.current === historyYears.min}
            >
              {historyYears.current - 1}
            </Button>
          </Col>
          <Col className="col-6">
            <Button
              onClick={nextYear}
              disabled={historyYears.current === historyYears.max}
            >
              {historyYears.current + 1}
            </Button>
          </Col>
        </Row>
      </>
    );
  }
};

const HistoryLayout = () => {
  const monthInfo = getMonthInfo(dateInfo.currentMonth, dateInfo.currentYear);

  return (
    <MonthIncomeProvider monthInfo={monthInfo}>
      <InnerHistoryLayout />
    </MonthIncomeProvider>
  );
};

export default HistoryLayout;
