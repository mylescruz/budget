import { Col, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";
import useHistory from "@/hooks/useHistory";
import { useEffect } from "react";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "../layout/loading";

const HistoryLayout = () => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  // Using the router object to redirect to different pages within the app
  const router = useRouter();

  const { history, historyLoading, postHistory, getMonthHistory } = useHistory(
    session.user.username
  );

  // If there is no user session, redirect to the home page
  if (!session) {
    router.push("/");
  }

  // Adds the current month to the history array if not already added
  useEffect(() => {
    // Sets the new month object and sends the POST request to the API
    const addNewHistoryMonth = async () => {
      const newMonth = {
        month: dateInfo.currentMonth,
        year: dateInfo.currentYear,
        budget: 0,
        actual: 0,
        leftover: 0,
      };

      await postHistory(newMonth);
    };

    // Checks if the current dates' month and year is already history array
    const monthInHistory = () => {
      const monthInfo = getMonthInfo(
        dateInfo.currentMonth,
        dateInfo.currentYear
      );
      const foundMonth = getMonthHistory(monthInfo);

      return foundMonth !== undefined;
    };

    if (!historyLoading && !monthInHistory()) {
      addNewHistoryMonth();
    }
  }, [history, historyLoading, postHistory, getMonthHistory]);

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
