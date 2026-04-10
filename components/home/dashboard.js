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
import {
  TransactionsContext,
  TransactionsProvider,
} from "@/contexts/TransactionsContext";
import getDateInfo from "@/helpers/getDateInfo";
import LoadingIndicator from "../ui/loadingIndicator";
import useMonthIncome from "@/hooks/useMonthIncome";
import dollarFormatter from "@/helpers/dollarFormatter";
import CategoryBadge from "../category/categoryBadge";
import AddTransactionsModal from "../budget/transactions/addTransactionsModal/addTransactionsModal";
import SuccessMessage from "../ui/successMessage";

const InnerDashboard = ({ dateInfo }) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const { categories, categoriesRequest } = useContext(CategoriesContext);
  const { transactionsRequest } = useContext(TransactionsContext);
  const { monthIncome, monthIncomeRequest } = useMonthIncome(
    dateInfo.month,
    dateInfo.year,
  );

  const [modal, setModal] = useState("none");

  // Get the top 5 categories to display on the dashboard
  const topCategories = useMemo(() => {
    if (!categories) {
      return null;
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
    setModal("addTransaction");
  };

  if (
    (categoriesRequest.action === "get" &&
      categoriesRequest.status === "loading") ||
    (transactionsRequest.action === "get" &&
      transactionsRequest.status === "loading") ||
    (monthIncomeRequest.action === "get" &&
      monthIncomeRequest.status === "loading")
  ) {
    return <LoadingIndicator message={"Loading your budget details"} />;
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
                      &#9432; {categoriesRequest.message}
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
                      className="w-100"
                      onClick={openAddTransaction}
                      disabled={!categories}
                    >
                      Add Transaction
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col className="col-12">
                <Card className="my-2 card-background">
                  <Card.Body>
                    <h4>
                      {dateInfo.monthName} Income:{" "}
                      {monthIncomeRequest.status === "error" ? (
                        <p className="text-danger fs-6 fw-bold">
                          {monthIncomeRequest.message}
                        </p>
                      ) : (
                        <p>{dollarFormatter(monthIncome)} </p>
                      )}
                    </h4>
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

        {categories && (
          <AddTransactionsModal
            dateInfo={dateInfo}
            modal={modal}
            setModal={setModal}
          />
        )}

        <SuccessMessage
          show={
            transactionsRequest.action === "create" &&
            transactionsRequest.status === "success"
          }
          message={transactionsRequest.message}
        />
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
