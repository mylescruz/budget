import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import CategoryPieChart from "../../categoriesCharts/categoryPieChart";
import styles from "@/styles/home/dashboard.module.css";
import getDateInfo from "@/helpers/getDateInfo";
import LoadingIndicator from "../../ui/loadingIndicator";
import dollarFormatter from "@/helpers/dollarFormatter";
import CategoryBadge from "../../category/categoryBadge";
import ErrorMessage from "../../ui/errorMessage";
import useDashboard from "@/hooks/useDashboard";
import { useMemo } from "react";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import DashboardSummary from "./dashboardSummary";
import addDecimalValues from "@/helpers/addDecimalValues";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";

const DashboardLayout = () => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const { dashboard, dashboardRequest } = useDashboard();

  const today = new Date();
  const dateInfo = getDateInfo(today);

  console.log(dashboard);

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

    const current = dashboard.totals.current;
    const previous = dashboard.totals.previous;

    const currentFunds =
      dollarsToCents(current.income) + dollarsToCents(current.transfersIn);
    const currentRemaining =
      currentFunds -
      dollarsToCents(current.transfersOut) -
      dollarsToCents(current.expenses);

    const previousFunds =
      dollarsToCents(previous.income) + dollarsToCents(previous.transfersIn);
    const previousRemaining =
      previousFunds -
      dollarsToCents(previous.transfersOut) -
      dollarsToCents(previous.expenses);

    const incomeTrend = Math.round(
      ((current.income - previous.income) / previous.income) * 100,
    );
    const incomeTrendColor = incomeTrend >= 0 ? "text-success" : "text-danger";

    const spendingTrend = Math.round(
      ((current.expenses - previous.expenses) / previous.expenses) * 100,
    );
    const spendingTrendColor =
      spendingTrend <= 0 ? "text-success" : "text-danger";

    console.log(previous.income, current.income);
    return {
      current: {
        ...current,
        funds: centsToDollars(currentFunds),
        remaining: centsToDollars(currentRemaining),
      },
      previous: {
        ...previous,
        funds: centsToDollars(previousFunds),
        remaining: centsToDollars(previousRemaining),
      },
      trends: {
        income: incomeTrend >= 0 ? `+${incomeTrend}%` : `${incomeTrend}%`,
        incomeColor: incomeTrendColor,
        expenses:
          spendingTrend >= 0 ? `+${spendingTrend}%` : `${spendingTrend}%`,
        expensesColor: spendingTrendColor,
      },
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
        {/* Hero Section */}
        <Row className="mb-4">
          <Col>
            <DashboardSummary dateInfo={dateInfo} totals={totals} />
          </Col>
        </Row>

        {/* Insights */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="bg-light shadow-sm border-0 rounded-4 h-100">
              <Card.Body>
                <h6 className="text-muted">Income Trend</h6>
                <h4 className="fw-bold">
                  {dollarFormatter(totals.current.income)}
                </h4>
                <p className={`mb-0 ${totals.trends.incomeColor}`}>
                  {totals.trends.income} vs last month
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="bg-light shadow-sm border-0 rounded-4 h-100">
              <Card.Body>
                <h6 className="text-muted">Spending Trend</h6>
                <h4 className="fw-bold">
                  {dollarFormatter(totals.current.expenses)}
                </h4>
                <p className={`mb-0 ${totals.trends.expensesColor}`}>
                  {totals.trends.expenses} vs last month
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="bg-light shadow-sm border-0 rounded-4 h-100">
              <Card.Body>
                <h6 className="text-muted">Top Category</h6>
                <h4 className="fw-bold">{top5Categories[0].name}</h4>
                <p className="mb-0">
                  {dollarFormatter(top5Categories[0].actual)} (
                  {Math.round(
                    (top5Categories[0].actual / totals.current.expenses) * 100,
                  )}
                  %)
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Activity */}
        <Row>
          <Col md={6}>
            <Card className="bg-light shadow-sm border-0 rounded-4 h-100">
              <Card.Body>
                <h6 className="text-muted mb-3">Top Spending Categories</h6>

                {dashboard.categories.slice(0, 10).map((category, index) => (
                  <div
                    key={category._id}
                    className="d-flex justify-content-between my-2"
                  >
                    <CategoryBadge
                      name={category.name}
                      color={category.color}
                    />
                    <div>{dollarFormatter(category.actual)}</div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="bg-light shadow-sm border-0 rounded-4 h-100">
              <Card.Body>
                <h6 className="text-muted mb-3">Spending Breakdown</h6>
                <CategoryPieChart categories={dashboard.categories} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
};

export default DashboardLayout;
