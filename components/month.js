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
        setTransactions([...transactions, newTransaction]);
    };
    
    let addModal = <InputTransaction transactions={transactions} updateTransactions={updateTransactions} categories={categories} show={addClicked} setAddClicked={setAddClicked}/>;
    let tableContainer = <TransactionsTable transactions={transactions}/>;

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
                
                {viewClicked && <Row>{tableContainer}</Row>}
                {addClicked && <>{addModal}</>}
            </Container>
        </>
    );
};

export default Month;