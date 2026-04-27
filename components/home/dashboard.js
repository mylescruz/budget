import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import styles from "@/styles/home/dashboard.module.css";
import getDateInfo from "@/helpers/getDateInfo";
import LoadingIndicator from "../ui/loadingIndicator";
import dollarFormatter from "@/helpers/dollarFormatter";
import CategoryBadge from "../category/categoryBadge";
import ErrorMessage from "../ui/errorMessage";
import useDashboard from "@/hooks/useDashboard";
import { useMemo } from "react";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";

const Dashboard = () => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const { dashboard, dashboardRequest } = useDashboard();

  const today = new Date();
  const dateInfo = getDateInfo(today);

  const top5Categories = useMemo(() => {
    if (!dashboard) {
      return null;
    }

    return dashboard.categories.slice(0, 5);
  }, [dashboard]);

  const totals = useMemo(() => {
    if (!dashboard) {
      return null;
    }

    return {
      income: dashboard.monthIncome,
      expenses: dashboard.monthExpenses,
      remaining: subtractDecimalValues(
        dashboard.monthIncome,
        dashboard.monthExpenses,
      ),
    };
  }, [dashboard]);

  if (
    dashboardRequest.action === "get" &&
    dashboardRequest.status === "loading"
  ) {
    return <LoadingIndicator message={dashboardRequest.message} />;
  } else {
    return (
      <Container>
        <Row className="d-flex mx-auto">
          <h2>{session ? `Welcome ${session.user.name}!` : "Welcome!"}</h2>
          <Col className="col-12 col-xl-8">
            <Card className="my-2 card-background">
              <Card.Body>
                <h3>{dateInfo.monthName} Spending</h3>
                <Row className="mx-auto d-flex">
                  {dashboard.categories ? (
                    <>
                      <Col className="col-12 col-lg-6">
                        <CategoryPieChart categories={dashboard.categories} />
                      </Col>
                      <Col className="col-12 col-lg-6">
                        <h5 className="text-center">Top 5 Categories</h5>
                        <Table borderless>
                          <tbody>
                            {top5Categories.map((category) => (
                              <tr key={category._id} className="d-flex">
                                <td
                                  className={`col-7 ${styles.grayBackground}`}
                                >
                                  <CategoryBadge
                                    name={category.name}
                                    color={category.color}
                                  />
                                </td>
                                <td
                                  className={`col-5 text-end ${styles.grayBackground}`}
                                >
                                  {dollarFormatter(category.actual)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Col>
                    </>
                  ) : (
                    <ErrorMessage message={dashboardRequest.message} />
                  )}
                  <Button as={Link} href="/budget" variant="primary">
                    View Full Budget
                  </Button>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col className="col-12 col-xl-4">
            <Row className="d-flex">
              <Col className="col-12">
                <Card className="my-2 card-background">
                  <Card.Body>
                    <h4>{dateInfo.monthName} Totals</h4>
                    <h5>
                      Income:{" "}
                      {totals.income ? (
                        <span>{dollarFormatter(totals.income)}</span>
                      ) : (
                        <span className="text-danger fw-bold">N/A</span>
                      )}
                    </h5>
                    <h5>
                      Expenses:{" "}
                      {totals.expenses ? (
                        <span>{dollarFormatter(totals.expenses)}</span>
                      ) : (
                        <span className="text-danger fw-bold">N/A</span>
                      )}
                    </h5>
                    <h5>
                      Remaining:{" "}
                      {totals.remaining ? (
                        <span
                          className={
                            totals.remaining < 0
                              ? "text-danger fw-bold"
                              : "text-dark"
                          }
                        >
                          {dollarFormatter(totals.remaining)}
                        </span>
                      ) : (
                        <span className="text-danger fw-bold">N/A</span>
                      )}
                    </h5>
                  </Card.Body>
                </Card>
              </Col>
              <Col className="col-12">
                <Card className="my-2 card-background">
                  <Card.Body>
                    <h4>{dateInfo.year} Income</h4>
                    <p>View your sources of income</p>
                    <Button
                      as={Link}
                      href="/income"
                      variant="primary"
                      className="w-100"
                    >
                      View Income
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col className="col-12">
                <Card className="my-2 card-background">
                  <Card.Body>
                    <h4>{dateInfo.year} Summary</h4>
                    <p>View your total spending for the year</p>
                    <Button
                      as={Link}
                      href={"/summary"}
                      variant="primary"
                      className="w-100"
                    >
                      View Summary
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
};

export default Dashboard;
