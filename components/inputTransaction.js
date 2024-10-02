import { useState } from "react";
import styles from "@/styles/inputTransaction.module.css";
import { Form, Button } from "react-bootstrap";

const InputTransaction = ({transactions, updateTransactions, categories}) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const startOfMonth = new Date(`${currentMonth}/01/${currentYear}`);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    const minDate = startOfMonth.toISOString().split('T')[0];
    const maxDate = endOfMonth.toISOString().split('T')[0];

    const emptyTransaction = {
        id: 0,
        date: minDate,
        store: "",
        items: "",
        category: "Rent",
        amount: ""
    };

    const [newTransaction, setTransaction] = useState(emptyTransaction);

    const handleInput = (e) => {
        setTransaction({ ...newTransaction, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setTransaction({ ...newTransaction, amount: input });
        else
            setTransaction({ ...newTransaction, amount: parseFloat(input) });
    };

    const AddTransaction = (e) => {
        e.preventDefault();
        
        let maxID = 0;
        if (transactions.length > 0)
            maxID = Math.max(...transactions.map(trans => trans.id));

        newTransaction.id = maxID + 1;
        updateTransactions(newTransaction);
        setTransaction(emptyTransaction);
    };

    return (
        <Form className="card w-25" onSubmit={AddTransaction}>
            <Form.Group className={styles.formInput}>
                <Form.Control
                    id="date"
                    className="h-100"
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={newTransaction.date}
                    onChange={handleInput}
                    required
                ></Form.Control>
            </Form.Group>
            <Form.Group className={styles.formInput}>
                <Form.Control
                    id="store"
                    className="h-100"
                    type="text"
                    placeholder="Store/Restaurant"
                    value={newTransaction.store}
                    onChange={handleInput}
                    required
                ></Form.Control>
            </Form.Group>
            <Form.Group className={styles.formInput}>
                <Form.Control
                    id="items"
                    className="h-100"
                    type="text"
                    placeholder="What was purchased?"
                    value={newTransaction.items}
                    onChange={handleInput}
                    required
                ></Form.Control>
            </Form.Group>
            <Form.Group className={styles.formInput}>
                <Form.Select id="category" className="h-100" 
                value={newTransaction.category}
                onChange={handleInput}
                required>
                    <option disabled>Choose a Category...</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className={styles.formInput}>
                <Form.Control
                    id="amount"
                    className="h-100"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Amount"
                    value={newTransaction.amount}
                    onChange={handleNumInput}
                    required
                ></Form.Control>
            </Form.Group>
            <Form.Group className={styles.formInput}>
                <Button type="submit" className="btn btn-primary">
                    Add
                </Button>
            </Form.Group>
        </Form>
    );
};

export default InputTransaction;