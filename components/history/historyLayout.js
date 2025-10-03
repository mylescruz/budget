import { Button, Col, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";
import useHistory from "@/hooks/useHistory";
import { useEffect, useState } from "react";
import todayInfo from "@/helpers/todayInfo";
import Loading from "../layout/loading";

const HistoryLayout = ({ dateInfo }) => {
  const { history, historyLoading } = useHistory();

  const [currentYearHistory, setCurrentYearHistory] = useState(history);
  const [historyYears, setHistoryYears] = useState({
    years: [],
    current: dateInfo.year,
    max: dateInfo.year,
    min: dateInfo.year,
  });

  // Get all the years in the history, the max, the min and the current year
  useEffect(() => {
    if (history) {
      const years = new Set(history.map((historyMonth) => historyMonth.year));
      const maxYear = Math.max(...years);
      const minYear = Math.min(...years);

      setHistoryYears({
        years: years,
        current: dateInfo.year,
        max: maxYear,
        min: minYear,
      });
    }
  }, [history, dateInfo]);

  // Filter the history to the current year
  useEffect(() => {
    if (history) {
      const givenYearHistory = history.filter(
        (historyMonth) => historyMonth.year === historyYears.current
      );

      if (historyYears.current === dateInfo.year) {
        const filteredHistory = givenYearHistory.filter(
          (historyMonth) => historyMonth.month < todayInfo.month
        );

        setCurrentYearHistory(filteredHistory);
      } else {
        setCurrentYearHistory(givenYearHistory);
      }
    }
  }, [history, historyYears, dateInfo]);

  const nextYear = () => {
    setHistoryYears({ ...historyYears, current: historyYears.current + 1 });
  };

  const previousYear = () => {
    setHistoryYears({ ...historyYears, current: historyYears.current - 1 });
  };

  if (historyLoading) {
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

export default HistoryLayout;
