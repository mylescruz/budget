import axios from "axios";
import AddTransaction from "./addTransaction";
import SummaryTable from "./summaryTable";
import TransactionsTable from "./transactionsTable";
import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import SummaryPieChart from "./summaryPieChart";
import deleteFromCategoryActual from "@/helpers/deleteFromCategoryActual";

const MonthBudget = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [viewClicked, setViewClicked] = useState(false);
    const [viewText, setViewText] = useState("View Transactions");
    const [addClicked, setAddClicked] = useState(false);
    const [pieValues, setPieValues] = useState(false);

    useEffect(() => {
        axios
        .get("/db/categories.json")
        .then((res) => {
            // console.log(res.data.categories);
            setCategories(res.data.categories);
        })
        .catch((err) => console.log(err));
    }, []);

    const updateTransactions = (newTransaction) => {
        const existingTransactionIndex = transactions.findIndex(transaction => {
            return transaction.id === newTransaction.id;
        });

        if (existingTransactionIndex !== -1) {
            const updatedTransactions = transactions.map(transaction => {
                if (transaction.id === newTransaction.id)
                    return newTransaction;
                else
                    return transaction;
            });
    
            setTransactions(updatedTransactions);
        } else {
            setTransactions([...transactions, newTransaction]);
        }

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
        setAddClicked(true);
    };

    const addModal = <AddTransaction transactions={transactions} updateTransactions={updateTransactions} categories={categories} setCategories={setCategories} show={addClicked} setAddClicked={setAddClicked} showTransactions={showTransactions}/>;
    const tableContainer = <TransactionsTable transactions={transactions} categories={categories} setCategories={setCategories} updateTransactions={updateTransactions} removeTransaction={removeTransaction}/>;

    return (
        <Container className="w-100">
            <Row>
                <Col><SummaryPieChart categories={categories} pieValues={pieValues} /></Col>
                <Col><SummaryTable transactions={transactions} categories={categories} setCategories={setCategories}/></Col>
            </Row>
        
            <Row className="mb-4 text-center">
                <Col><Button variant="secondary" onClick={toggleTransactions}>{viewText}</Button></Col>
                <Col><Button variant="primary" onClick={addTransaction}>Add Transaction</Button></Col>
            </Row>
            
            {viewClicked && <>{tableContainer}</>}
            {addClicked && <>{addModal}</>}
        </Container>
    );
};

export default MonthBudget;