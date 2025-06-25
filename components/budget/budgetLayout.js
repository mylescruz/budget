import CategoryTable from "./categoryTable/categoryTable";
import TransactionsTable from "./transactionsTable/transactionsTable";
import { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import EditCategoryTable from "./editCategoryTable/editCategoryTable";
import {
  CategoriesContext,
  CategoriesProvider,
} from "@/contexts/CategoriesContext";
import CategoryPieChart from "../categories/categoryPieChart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "../layout/loading";
import {
  TransactionsContext,
  TransactionsProvider,
} from "@/contexts/TransactionsContext";
import AddTransactionModal from "./transactionsTable/addTransactionModal";

const InnerBudgetLayout = ({ monthInfo }) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  // Using the router object to redirect to different pages within the app
  const router = useRouter();

  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const { transactions, transactionsLoading } = useContext(TransactionsContext);
  const [viewClicked, setViewClicked] = useState(false);
  const [viewText, setViewText] = useState("View Transactions");
  const [addTransactionClicked, setAddTransactionClicked] = useState(false);
  const [nullTransactions, setNullTransactions] = useState(
    transactions === null
  );

  // If there is an error loading the transaction data, show the user an error message
  useEffect(() => {
    if (transactions) {
      setNullTransactions(false);
    } else {
      setNullTransactions(true);
    }
  }, [transactions]);

  const [editClicked, setEditClicked] = useState(false);

  // If there is no user session, redirect to the home page
  if (!session) {
    router.push("/");
  }

  // If the categories or transactions are still being loaded by the API, show the loading component
  if (categoriesLoading || transactionsLoading) {
    return <Loading />;
  }

  const showTransactions = () => {
    setViewClicked(true);
    setViewText("Hide Transactions");
  };

  const toggleTransactions = () => {
    if (viewClicked) {
      setViewClicked(false);
      setViewText("View Transactions");
    } else {
      showTransactions();
    }
  };

  const addTransaction = () => {
    setAddTransactionClicked(true);
    showTransactions();
  };

  const categoryTableProps = {
    setEditClicked: setEditClicked,
    monthInfo: monthInfo,
  };

  const editCategoryTableProps = {
    setEditClicked: setEditClicked,
    monthInfo: monthInfo,
  };

  const transactionsTableProps = {
    monthInfo: monthInfo,
  };

  const addTransactionModalProps = {
    monthInfo: monthInfo,
    addTransactionClicked: addTransactionClicked,
    setAddTransactionClicked: setAddTransactionClicked,
    showTransactions: showTransactions,
  };

  return (
    <Container className="w-100">
      <aside className="info-text mx-auto text-center">
        <h1>
          {monthInfo.month} {monthInfo.year}
        </h1>
        <p className="fs-6">
          Set your budget for your fixed and variable expenses. Log all your
          transactions made this month. See how much you spent based on the
          category.
        </p>
      </aside>

      {categories ? (
        <>
          <Row>
            <Col className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6 mt-4">
              <CategoryPieChart categories={categories} />
            </Col>
            <Col className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6">
              {!editClicked ? (
                <CategoryTable {...categoryTableProps} />
              ) : (
                <EditCategoryTable {...editCategoryTableProps} />
              )}
            </Col>
          </Row>

          {!editClicked && (
            <>
              <Row className="option-buttons text-center">
                <Col>
                  <Button
                    id="view-transactions-btn"
                    variant="secondary"
                    onClick={toggleTransactions}
                  >
                    {viewText}
                  </Button>
                </Col>
                <Col>
                  <Button
                    id="add-transaction-btn"
                    variant="primary"
                    onClick={addTransaction}
                    disabled={editClicked || nullTransactions}
                  >
                    Add Transaction
                  </Button>
                </Col>
              </Row>

              {viewClicked && (
                <Row className="d-flex">
                  <Col className="col-12 col-xl-10 mx-auto">
                    <TransactionsTable {...transactionsTableProps} />
                  </Col>
                </Row>
              )}
            </>
          )}

          {addTransactionClicked && (
            <AddTransactionModal {...addTransactionModalProps} />
          )}
        </>
      ) : (
        <Row className="d-flex">
          <Col className="col-12 col-xl-10 mx-auto">
            <Table striped className="mb-4">
              <thead className="table-dark">
                <tr className="d-flex">
                  <th className="col-6">Category</th>
                  <th className="d-none d-md-block col-md-2">Budget</th>
                  <th className="col-3 col-md-2">Spent</th>
                  <th className="col-3 col-md-2 cell">Remaining</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={1} className="text-danger fw-bold text-center">
                    &#9432; There was an error loading your categories. Please
                    try again later!
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col className="col-12 col-xl-10 mx-auto">
            <TransactionsTable {...transactionsTableProps} />
          </Col>
        </Row>
      )}
    </Container>
  );
};

const BudgetLayout = ({ monthInfo }) => {
  return (
    <CategoriesProvider monthInfo={monthInfo}>
      <TransactionsProvider monthInfo={monthInfo}>
        <InnerBudgetLayout monthInfo={monthInfo} />
      </TransactionsProvider>
    </CategoriesProvider>
  );
};

export default BudgetLayout;
