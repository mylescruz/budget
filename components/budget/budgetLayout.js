import AddTransaction from "./transactionsTable/addTransaction";
import CategoryTable from "./categoryTable/categoryTable";
import TransactionsTable from "./transactionsTable/transactionsTable";
import { useContext, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import deleteFromCategoryActual from "@/helpers/deleteFromCategoryActual";
import EditCategoryTable from "./editCategoryTable/editCategoryTable";
import { CategoriesContext, CategoriesProvider } from "@/contexts/CategoriesContext";
import useTransactions from "@/hooks/useTransactions";
import SummaryPieChart from "./summaryPieChart";

const InnerBudgetLayout = ({ monthInfo }) => {
    const { categories, putCategories } = useContext(CategoriesContext);
    const { transactions, postTransaction, putTransaction, deleteTransaction } = useTransactions(monthInfo.month, monthInfo.year);
    const [viewClicked, setViewClicked] = useState(false);
    const [viewText, setViewText] = useState("View Transactions");
    const [addTransactionClicked, setAddTransactionClicked] = useState(false);
    const [editClicked, setEditClicked] = useState(false);

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
    };

    const transactionsTableProps = {
        transactions: transactions,
        putTransaction: putTransaction,
        deleteTransaction: deleteTransaction,
        monthInfo: monthInfo
    };

    const addTransactionsProps = {
        transactions: transactions,
        postTransaction: postTransaction,
        monthInfo: monthInfo,
        addTransactionClicked: addTransactionClicked,
        setAddTransactionClicked: setAddTransactionClicked,
        showTransactions: showTransactions
    };

    return (
        <Container className="w-100">
            <header className="container my-4">
                <h1 className="text-center">{monthInfo.month} {monthInfo.year} Budget</h1>
            </header>

            <Row>
                <Col className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6 pie"><SummaryPieChart /></Col>
                <Col className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6">
                    {!editClicked ? <CategoryTable setEditClicked={setEditClicked} monthInfo={monthInfo} />
                        : <EditCategoryTable setEditClicked={setEditClicked} monthInfo={monthInfo} />}
                </Col>
            </Row>
        
            <Row className="option-buttons text-center">
                <Col><Button id="view-transactions-btn" variant="secondary" onClick={toggleTransactions}>{viewText}</Button></Col>
                <Col><Button id="add-transaction-btn" variant="primary" onClick={addTransaction} disabled={editClicked}>Add Transaction</Button></Col>
            </Row>
            
            {viewClicked && <TransactionsTable {...transactionsTableProps} />}
            {addTransactionClicked && <AddTransaction {...addTransactionsProps} />}
        </Container>
    );
};

const BudgetLayout = ({ monthInfo }) => {

    return (
        <CategoriesProvider monthInfo={monthInfo} >
            <InnerBudgetLayout monthInfo={monthInfo} />
        </CategoriesProvider>
    );
};

export default BudgetLayout;