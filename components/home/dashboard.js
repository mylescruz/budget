import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import {
  CategoriesContext,
  CategoriesProvider,
} from "@/contexts/CategoriesContext";
import { useContext, useMemo, useState } from "react";
import styles from "@/styles/home/dashboard.module.css";
import AddTransactionModal from "../budget/transactions/addTransactionModal";
import {
  TransactionsContext,
  TransactionsProvider,
} from "@/contexts/TransactionsContext";
import getDateInfo from "@/helpers/getDateInfo";
import LoadingIndicator from "../layout/loadingIndicator";
import useMonthIncome from "@/hooks/useMonthIncome";
import dollarFormatter from "@/helpers/dollarFormatter";
import CategoryBadge from "../category/categoryBadge";

const InnerDashboard = ({ dateInfo }) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const { transactionsLoading } = useContext(TransactionsContext);
  const { monthIncome, monthIncomeLoading } = useMonthIncome(
    dateInfo.month,
    dateInfo.year,
  );

  const [addTransactionClicked, setAddTransactionClicked] = useState(false);

  // Get the top 5 categories to display on the dashboard
  const topCategories = useMemo(() => {
    if (!categories) {
      return [];
    }

    return categories
      .filter((category) => {
        return category.actual > 0;
      })
      .map((category) => {
        return {
          ...category,
          style: {
            backgroundColor: category.color,
            border: category.color,
          },
        };
      })
      .sort((categoryA, categoryB) => {
        return categoryB.actual - categoryA.actual;
      })
      .slice(0, 5);
  }, [categories]);

  const openAddTransaction = () => {
    setAddTransactionClicked(true);
  };

  const addTransactionModalProps = {
    dateInfo: dateInfo,
    addTransactionClicked: addTransactionClicked,
    setAddTransactionClicked: setAddTransactionClicked,
  };

  if (categoriesLoading || transactionsLoading || monthIncomeLoading) {
    return <LoadingIndicator />;
  } else {
    return (
      <Container>
        <Row className="d-flex mx-auto">
          <h2>Welcome {session.user.name}!</h2>
          <Col className="col-12 col-xl-8">
            <Card className="my-2 card-background">
              <Card.Body>
                <h3>{dateInfo.monthName} Spending</h3>
                <Row className="mx-auto d-flex">
                  {categories ? (
                    <>
                      <Col className="col-12 col-lg-6">
                        <CategoryPieChart categories={categories} />
                      </Col>
                      <Col className="col-12 col-lg-6">
                        <h5 className="text-center">Top Categories</h5>
                        <Table borderless>
                          <tbody>
                            {topCategories.map((category) => (
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
                    <p className="text-danger fw-bold text-center">
                      &#9432; There was an error loading your budget. Please try
                      again later!
                    </p>
                  )}
                  <Button
                    as={Link}
                    href="/budget"
                    disabled={!categories}
                    variant="primary"
                  >
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
                    <h3>New Transaction</h3>
                    <p>Add a transaction for the current month</p>
                    <Button
                      variant="primary"
                      onClick={openAddTransaction}
                      disabled={!categories}
                    >
                      Add
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col className="col-12">
                <Card className="my-2 card-background">
                  <Card.Body>
                    <h4>
                      {dateInfo.monthName} Income:{" "}
                      {monthIncome !== null ? (
                        <p>{dollarFormatter(monthIncome)} </p>
                      ) : (
                        <p className="text-danger fw-bold">
                          Income Unavailable
                        </p>
                      )}
                    </h4>
                    <p>View your sources of income</p>
                    <Button as={Link} href="/income" variant="primary">
                      Income
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
                      href={{
                        pathname: "/summary",
                        query: { year: dateInfo.year },
                      }}
                      variant="primary"
                    >
                      Summary
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {addTransactionClicked && (
          <AddTransactionModal {...addTransactionModalProps} />
        )}
      </Container>
    );
  }
};

const Dashboard = () => {
  const today = new Date();
  const dateInfo = getDateInfo(today);

  return (
    <CategoriesProvider dateInfo={dateInfo}>
      <TransactionsProvider dateInfo={dateInfo}>
        <InnerDashboard dateInfo={dateInfo} />
      </TransactionsProvider>
    </CategoriesProvider>
  );
};

export default Dashboard;
