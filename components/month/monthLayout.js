import AddTransaction from "./transactionsTable/addTransaction";
import CategoryTable, { CategoryTableMemo } from "./categoryTable/categoryTable";
import TransactionsTable from "./transactionsTable/transactionsTable";
import { useContext, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import deleteFromCategoryActual from "@/helpers/deleteFromCategoryActual";
import EditCategoryTable from "./editCategoryTable/editCategoryTable";
import { CategoriesContext, CategoriesProvider } from "@/contexts/CategoriesContext";
import useTransactions from "@/hooks/useTransactions";
import dateInfo from "@/helpers/dateInfo";
import Title from "./title";
import SummaryPieChart from "./summaryPieChart";

const InnerLayout = () => {
    const { categories, putCategories } = useContext(CategoriesContext);
    const { transactions, addNewTransaction, updateTransaction, deleteFromTransactions } = useTransactions(dateInfo.currentMonth, dateInfo.currentYear);
    const [viewClicked, setViewClicked] = useState(false);
    const [viewText, setViewText] = useState("View Transactions");
    const [addTransactionClicked, setAddTransactionClicked] = useState(false);
    const [editClicked, setEditClicked] = useState(false);

    const removeTransaction = (transactionToDelete) => {
        deleteFromTransactions(transactionToDelete);

        const updatedCategories = deleteFromCategoryActual(transactionToDelete, categories);
        putCategories(updatedCategories);
    };

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
        updateTransaction: updateTransaction,
        removeTransaction: removeTransaction
    };

    const addTransactionsProps = {
        transactions: transactions,
        addNewTransaction: addNewTransaction,
        addTransactionClicked: addTransactionClicked,
        setAddTransactionClicked: setAddTransactionClicked,
        showTransactions: showTransactions
    };

    return (
        <Container className="w-100">
            <Title month={dateInfo.currentMonth}/>

            <Row>
                <Col className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6 pie"><SummaryPieChart /></Col>
                <Col className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6">
                    {!editClicked ? <CategoryTableMemo setEditClicked={setEditClicked} />
                        : <EditCategoryTable setEditClicked={setEditClicked} />}
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

const MonthLayout = ({ props }) => {
    return (
        <CategoriesProvider>
            <InnerLayout {...props} />
        </CategoriesProvider>
    );
};

export default MonthLayout;