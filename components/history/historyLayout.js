import { Col, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";
import useHistory from "@/hooks/useHistory";
import { useEffect } from "react";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "../layout/loading";
import useIncome from "@/hooks/useIncome";

const HistoryLayout = () => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  // Using the router object to redirect to different pages within the app
  const router = useRouter();

  const { history, historyLoading, postHistory, getMonthHistory } = useHistory(
    session.user.username
  );
  const { getMonthIncome } = useIncome(
    session.user.username,
    dateInfo.currentYear
  );

  // If there is no user session, redirect to the home page
  if (!session) {
    router.push("/");
  }

  // Adds the current month to the history array if not already added
  useEffect(() => {
    const monthInfo = getMonthInfo(dateInfo.currentMonth, dateInfo.currentYear);

    // Sets the new month object and sends the POST request to the API
    const addNewHistoryMonth = async () => {
      const newMonthIncome = getMonthIncome(monthInfo);

      const newMonth = {
        month: dateInfo.currentMonth,
        year: dateInfo.currentYear,
        budget: newMonthIncome,
        actual: 0,
        leftover: newMonthIncome,
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
  }, [history, historyLoading, postHistory, getMonthHistory, getMonthIncome]);

  // If the history is still being loaded by the API, show the loading component
  if (historyLoading) {
    return <Loading />;
  }

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
          <HistoryTable history={history} />
        </Col>
      </Row>
    </>
  );
};

export default HistoryLayout;
