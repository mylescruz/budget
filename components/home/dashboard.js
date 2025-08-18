import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import CategoryPieChart from "../categories/categoryPieChart";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import {
  CategoriesContext,
  CategoriesProvider,
} from "@/contexts/CategoriesContext";
import currencyFormatter from "@/helpers/currencyFormatter";
import Loading from "../layout/loading";
import { useContext, useEffect, useState } from "react";
import styles from "@/styles/home/dashboard.module.css";
import AddTransactionModal from "../budget/transactions/addTransactionModal";
import {
  TransactionsContext,
  TransactionsProvider,
} from "@/contexts/TransactionsContext";
import {
  PaychecksContext,
  PaychecksProvider,
} from "@/contexts/PaychecksContext";

const InnerDashboard = ({ monthInfo }) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const { transactionsLoading } = useContext(TransactionsContext);
  const { paychecks, paychecksLoading, getMonthIncome } =
    useContext(PaychecksContext);
  const [topCategories, setTopCategories] = useState([]);
  const [addTransactionClicked, setAddTransactionClicked] = useState(false);
  const [monthIncome, setMonthIncome] = useState(0);
  const router = useRouter();

  // Get the top 5 categories to display on the dashboard
  useEffect(() => {
    if (categories) {
      const topFiveCategories = categories
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

      setTopCategories(topFiveCategories);
    }
  }, [categories]);

  // Get the user's income for the current month
  useEffect(() => {
    if (!paychecksLoading) {
      setMonthIncome(getMonthIncome(monthInfo));
    }
  }, [paychecksLoading, getMonthIncome, monthInfo]);

  const openAddTransaction = () => {
    setAddTransactionClicked(true);
  };

  const addTransactionModalProps = {
    monthInfo: monthInfo,
    addTransactionClicked: addTransactionClicked,
    setAddTransactionClicked: setAddTransactionClicked,
  };

  // If there is no user session, redirect to the home page
  if (!session) {
    router.push("/");
  } else if (categoriesLoading || transactionsLoading || paychecksLoading) {
    return <Loading />;
  } else {
    return (
      <Container>
        <Row className="d-flex mx-auto">
          <h2>Welcome {session.user.name}!</h2>
          <Col className="col-12 col-xl-8">
            <Card className="my-2 card-background">
              <Card.Body>
                <h3>{monthInfo.month} Spending</h3>
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
                              <tr key={category.id} className="d-flex">
                                <td
                                  className={`col-7 ${styles.grayBackground}`}
                                >
                                  <Button
                                    style={category.style}
                                    className="btn-sm fw-bold"
                                  >
                                    {category.name}
                                  </Button>
                                </td>
                                <td
                                  className={`col-5 text-end ${styles.grayBackground}`}
                                >
                                  {currencyFormatter.format(category.actual)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Col>
                    </>
                  ) : (
                    <p className="text-danger fw-bold text-center">
                      &#9432; There was an error loading your categories. Please
                      try again later!
                    </p>
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
                      {monthInfo.month} Income:{" "}
                      {monthIncome !== null ? (
                        <p>{currencyFormatter.format(monthIncome)} </p>
                      ) : (
                        <p className="text-danger fw-bold">
                          Income Unavailable
                        </p>
                      )}
                    </h4>
                    <p>View all your paychecks</p>
                    <Button as={Link} href="/income" variant="primary">
                      Income
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col className="col-12">
                <Card className="my-2 card-background">
                  <Card.Body>
                    <h4>{monthInfo.year} Summary</h4>
                    <p>View your total spending for the year</p>
                    <Button
                      as={Link}
                      href="/summary"
                      variant="primary"
                      className=""
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
  const month = dateInfo.currentMonth;
  const year = dateInfo.currentYear;
  const monthInfo = getMonthInfo(month, year);

  return (
    <CategoriesProvider monthInfo={monthInfo}>
      <TransactionsProvider monthInfo={monthInfo}>
        <PaychecksProvider monthInfo={monthInfo}>
          <InnerDashboard monthInfo={monthInfo} />
        </PaychecksProvider>
      </TransactionsProvider>
    </CategoriesProvider>
  );
};

export default Dashboard;
