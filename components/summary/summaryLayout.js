import useSummary from "@/hooks/useSummary";
import { useSession } from "next-auth/react";
import Loading from "../layout/loading";
import SummaryTable from "./summaryTable";
import { Col, Container, Row } from "react-bootstrap";
import CategoryPieChart from "../categories/categoryPieChart";

const SummaryLayout = ({ year }) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const { summary, summaryLoading } = useSummary(session.user.username, year);

  if (summaryLoading) {
    return <Loading />;
  } else {
    return (
      <Container className="w-100">
        <aside className="info-text text-center mx-auto">
          <h1>{year} Summary</h1>
          <p>View all your spending by category for the year.</p>
        </aside>

        <Row>
          <Col className="col-12 col-xl-6 mt-4">
            <CategoryPieChart categories={summary} />
          </Col>
          <Col className="col-12 col-xl-6">
            <SummaryTable summary={summary} />
          </Col>
        </Row>
      </Container>
    );
  }
};

export default SummaryLayout;
