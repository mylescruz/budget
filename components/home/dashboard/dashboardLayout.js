import { Card, Col, Container, Row } from "react-bootstrap";
import CategoryPieChart from "../../categoriesCharts/categoryPieChart";
import getDateInfo from "@/helpers/getDateInfo";
import LoadingIndicator from "../../ui/loadingIndicator";
import dollarFormatter from "@/helpers/dollarFormatter";
import CategoryBadge from "../../category/categoryBadge";
import useDashboard from "@/hooks/useDashboard";
import { useMemo } from "react";
import DashboardSummary from "./dashboardSummary";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";

const DashboardLayout = () => {
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
            <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
              <h6 className="text-muted">{dateInfo.monthName} Income</h6>
              <h4 className="fw-bold">
                {dollarFormatter(totals.current.income)}
              </h4>
              <p className={`mb-0 ${totals.trends.incomeColor}`}>
                {totals.trends.income} vs last month (
                {dollarFormatter(totals.previous.income)})
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
              <h6 className="text-muted">{dateInfo.monthName} Spending</h6>
              <h4 className="fw-bold">
                {dollarFormatter(totals.current.expenses)}
              </h4>
              <p className={`mb-0 ${totals.trends.expensesColor}`}>
                {totals.trends.expenses} vs last month (
                {dollarFormatter(totals.previous.expenses)})
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
              <h6 className="text-muted">
                {dateInfo.monthName}'s Top Category
              </h6>
              <h4 className="fw-bold">{top5Categories[0].name}</h4>
              <p className="mb-0">
                {dollarFormatter(top5Categories[0].actual)} (
                {Math.round(
                  (top5Categories[0].actual / totals.current.expenses) * 100,
                )}
                %)
              </p>
            </div>
          </Col>
        </Row>

        {/* Activity */}
        <Row>
          <Col md={6}>
            <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
              <h6 className="text-muted mb-3">
                {dateInfo.monthName}'s Top Spending Categories
              </h6>

              {dashboard.categories.slice(0, 10).map((category, index) => (
                <div
                  key={category._id}
                  className="d-flex justify-content-between my-4"
                >
                  <CategoryBadge name={category.name} color={category.color} />
                  <div>{dollarFormatter(category.actual)}</div>
                </div>
              ))}
            </div>
          </Col>
          <Col md={6}>
            <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
              <h6 className="text-muted mb-3">
                {dateInfo.monthName}'s Spending Breakdown
              </h6>
              <CategoryPieChart categories={dashboard.categories} />
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
};

export default DashboardLayout;
