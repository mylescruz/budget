import axios from "axios";
import AddTransaction from "./addTransaction";
import CategoryTable from "./categoryTable";
import TransactionsTable from "./transactionsTable";
import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import SummaryPieChart from "./summaryPieChart";
import deleteFromCategoryActual from "@/helpers/deleteFromCategoryActual";
import EditCategoryTable from "./editCategoryTable";

const MonthBudget = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [viewClicked, setViewClicked] = useState(false);
    const [viewText, setViewText] = useState("View Transactions");
    const [addTransactionClicked, setAddTransactionClicked] = useState(false);
    const [pieValues, setPieValues] = useState(false);
    const [editClicked, setEditClicked] = useState(false);

    useEffect(() => {
        axios
        .get("/db/categories.json")
        .then((res) => {
            // console.log(res.data.categories);
            setCategories(res.data.categories);
        })
        .catch((err) => console.log(err));
    }, []);

    const addToTransactions = (newTransaction) => {
        setTransactions([...transactions, newTransaction]);

        setPieValues(true);
    };

    const editOldTransaction = (edittedTransaction) => {
        const updatedTransactions = transactions.map(transaction => {
            if (transaction.id === edittedTransaction.id)
                return edittedTransaction;
            else
                return transaction;
        });
        setTransactions(updatedTransactions);

        setPieValues(true);
    };

    const removeTransaction = (transactionToRemove) => {
        const updatedTransactions = transactions.filter(transaction => {
            return transaction.id !== transactionToRemove.id;
        });

        setTransactions(updatedTransactions);

        const updatedCategories = deleteFromCategoryActual(transactionToRemove, categories);
        setCategories(updatedCategories);
        
        if (updatedTransactions.length > 0)
            setPieValues(true);
        else
            setPieValues(false);
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

    const addTransactionModal = <AddTransaction transactions={transactions} addToTransactions={addToTransactions} categories={categories} setCategories={setCategories} addTransactionClicked={addTransactionClicked} setAddTransactionClicked={setAddTransactionClicked} showTransactions={showTransactions}/>;
    const tableContainer = <TransactionsTable transactions={transactions} categories={categories} setCategories={setCategories} editOldTransaction={editOldTransaction} removeTransaction={removeTransaction}/>;

    return (
        <Container className="w-100">
            <Row>
                <Col><SummaryPieChart categories={categories} pieValues={pieValues} /></Col>
                <Col>{!editClicked ?
                    <CategoryTable categories={categories} setEditClicked={setEditClicked} />
                    :
                    <EditCategoryTable categories={categories} setCategories={setCategories} setEditClicked={setEditClicked} />
                }</Col>
            </Row>
        
            <Row className="mb-4 text-center">
                <Col><Button variant="secondary" onClick={toggleTransactions}>{viewText}</Button></Col>
                <Col><Button variant="primary" onClick={addTransaction} disabled={editClicked}>Add Transaction</Button></Col>
            </Row>
            
            {viewClicked && <>{tableContainer}</>}
            {addTransactionClicked && <>{addTransactionModal}</>}
        </Container>
    );
};

export default MonthBudget;