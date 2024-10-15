import AddTransaction from "./transactionsTable/addTransaction";
import CategoryTable, { CategoryTableMemo } from "./categoryTable/categoryTable";
import TransactionsTable from "./transactionsTable/transactionsTable";
import { useContext, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import SummaryPieChart from "./summaryPieChart";
import deleteFromCategoryActual from "@/helpers/deleteFromCategoryActual";
import EditCategoryTable from "./editCategoryTable/editCategoryTable";
import { CategoriesContext, CategoriesProvider } from "@/contexts/CategoriesContext";
import useTransactions from "@/hooks/useTransactions";
import dateInfo from "@/helpers/dateInfo";

const InnerLayout = () => {
    const { categories, updateCategories } = useContext(CategoriesContext);
    const currentMonth = dateInfo.currentMonth;
    const { transactions, setTransactions, addNewTransaction, updateTransaction } = useTransactions(currentMonth);
    const [viewClicked, setViewClicked] = useState(false);
    const [viewText, setViewText] = useState("View Transactions");
    const [addTransactionClicked, setAddTransactionClicked] = useState(false);
    const [editClicked, setEditClicked] = useState(false);

    const addToTransactions = (newTransaction) => {
        addNewTransaction(newTransaction);
    };

    const editOldTransaction = (edittedTransaction) => {
        updateTransaction(edittedTransaction);
    };

    const removeTransaction = (transactionToRemove) => {
        const updatedTransactions = transactions.filter(transaction => {
            return transaction.id !== transactionToRemove.id;
        });

        setTransactions(updatedTransactions);

        const updatedCategories = deleteFromCategoryActual(transactionToRemove, categories);
        updateCategories(updatedCategories);
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
        editOldTransaction: editOldTransaction,
        removeTransaction: removeTransaction
    };

    const addTransactionsProps = {
        transactions: transactions,
        addToTransactions: addToTransactions,
        addTransactionClicked: addTransactionClicked,
        setAddTransactionClicked: setAddTransactionClicked,
        showTransactions: showTransactions
    };

    return (
        <Container className="w-100">
            <Row>
                <Col><SummaryPieChart /></Col>
                <Col>{!editClicked ?
                    <CategoryTableMemo setEditClicked={setEditClicked} />
                    :
                    <EditCategoryTable setEditClicked={setEditClicked} />
                }</Col>
            </Row>
        
            <Row className="mb-4 text-center">
                <Col><Button variant="secondary" onClick={toggleTransactions}>{viewText}</Button></Col>
                <Col><Button variant="primary" onClick={addTransaction} disabled={editClicked}>Add Transaction</Button></Col>
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