import axios from "axios";
import InputTransaction from "./inputTransaction";
import SummaryTable from "./summaryTable";
import TransactionsTable from "./transactionsTable";
import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

const Month = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [viewClicked, setViewClicked] = useState(false);
    const [viewText, setViewText] = useState("View Transactions");
    const [addClicked, setAddClicked] = useState(false);

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
            const updated = transactions.map(transaction => {
                if (transaction.id === newTransaction.id)
                    return newTransaction;
                else
                    return transaction;
            });
    
            setTransactions(updated);
        } else {
            setTransactions([...transactions, newTransaction]);
        }
    };

    const removeTransaction = (transactionToRemove) => {
        const updated = transactions.filter(transaction => {
            return transaction.id !== transactionToRemove.id;
        });
        console.log(updated);

        setTransactions(updated);
    };
    
    const addModal = <InputTransaction transactions={transactions} updateTransactions={updateTransactions} categories={categories} show={addClicked} setAddClicked={setAddClicked} />;
    const tableContainer = <TransactionsTable transactions={transactions} categories={categories} updateTransactions={updateTransactions} removeTransaction={removeTransaction}/>;

    const addTransaction = () => {
        setAddClicked(true);
    };

    const showTransactions = () => {
        if (viewClicked) {
            setViewClicked(false);
            setViewText("View Transactions");
        } else {
            setViewClicked(true);
            setViewText("Hide Transactions");
        }
    };

    return (
        <>
            <Container className="w-100">
                <Row>
                    <Col><SummaryTable transactions={transactions} categories={categories} /></Col>
                </Row>
            
                <Row className="mb-4 text-center">
                    <Col><Button variant="secondary" onClick={showTransactions}>{viewText}</Button></Col>
                    <Col><Button variant="primary" onClick={addTransaction}>Add Transaction</Button></Col>
                </Row>
                
                {viewClicked && <>{tableContainer}</>}
                {addClicked && <>{addModal}</>}
            </Container>
        </>
    );
};

export default Month;