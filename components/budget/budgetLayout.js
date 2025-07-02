import CategoryTable from "./categoryTable/categoryTable";
import TransactionsTable from "./transactions/transactionsTable";
import { useContext, useState } from "react";
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
import AddTransactionModal from "./transactions/addTransactionModal";
import TransactionsLayout from "./transactions/transactionsLayout";

const InnerBudgetLayout = ({ monthInfo }) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  // Using the router object to redirect to different pages within the app
  const router = useRouter();

  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const [editCategories, setEditCategories] = useState(false);

  // If there is no user session, redirect to the home page
  if (!session) {
    router.push("/");
  }

  const categoryTableProps = {
    setEditCategories: setEditCategories,
    monthInfo: monthInfo,
  };

  const editCategoryTableProps = {
    setEditCategories: setEditCategories,
    monthInfo: monthInfo,
  };

  if (categoriesLoading) {
    return <Loading />;
  } else {
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
              <Col className="col-12 col-xl-6">
                <CategoryPieChart categories={categories} />
              </Col>
              <Col className="col-12 col-xl-6">
                {!editCategories ? (
                  <CategoryTable {...categoryTableProps} />
                ) : (
                  <EditCategoryTable {...editCategoryTableProps} />
                )}
              </Col>
            </Row>

            {!editCategories && <TransactionsLayout monthInfo={monthInfo} />}
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
          </Row>
        )}
      </Container>
    );
  }
};

const BudgetLayout = ({ monthInfo }) => {
  return (
    <CategoriesProvider monthInfo={monthInfo}>
      <InnerBudgetLayout monthInfo={monthInfo} />
    </CategoriesProvider>
  );
};

export default BudgetLayout;
