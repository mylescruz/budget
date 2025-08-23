import CategoryTable from "./categoryTable/categoryTable";
import { useContext, useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import EditCategoryTable from "./editCategoryTable/editCategoryTable";
import {
  CategoriesContext,
  CategoriesProvider,
} from "@/contexts/CategoriesContext";
import CategoryPieChart from "../categories/categoryPieChart";
import Loading from "../layout/loading";
import TransactionsLayout from "./transactions/transactionsLayout";
import {
  TransactionsContext,
  TransactionsProvider,
} from "@/contexts/TransactionsContext";
import { PaychecksProvider } from "@/contexts/PaychecksContext";
import {
  MonthIncomeProvider,
  MonthIncomeContext,
} from "@/contexts/MonthIncomeContext";

const InnerBudgetLayout = ({ monthInfo }) => {
  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const { transactionsLoading } = useContext(TransactionsContext);
  const { monthIncomeLoading } = useContext(MonthIncomeContext);

  const [editCategories, setEditCategories] = useState(false);

  if (categoriesLoading || transactionsLoading || monthIncomeLoading) {
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
                  <CategoryTable
                    setEditCategories={setEditCategories}
                    monthInfo={monthInfo}
                  />
                ) : (
                  <EditCategoryTable
                    monthInfo={monthInfo}
                    setEditCategories={setEditCategories}
                  />
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
      <TransactionsProvider monthInfo={monthInfo}>
        <PaychecksProvider monthInfo={monthInfo}>
          <MonthIncomeProvider monthInfo={monthInfo}>
            <InnerBudgetLayout monthInfo={monthInfo} />
          </MonthIncomeProvider>
        </PaychecksProvider>
      </TransactionsProvider>
    </CategoriesProvider>
  );
};

export default BudgetLayout;
