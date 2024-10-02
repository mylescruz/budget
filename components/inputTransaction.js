import { useState } from "react";
import styles from "@/styles/inputTransaction.module.css";
import { Card, Container } from "react-bootstrap";

const InputTransaction = ({transactions, updateTransactions, categories}) => {
    const emptyTransaction = {
        id: 999,
        date: "",
        store: "",
        items: "",
        category: "",
        amount: 0
    };

    const [newTransaction, setTransaction] = useState(emptyTransaction);
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const startOfMonth = new Date(`${currentMonth}/01/${currentYear}`);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    const minDate = startOfMonth.toISOString().split('T')[0];
    const maxDate = endOfMonth.toISOString().split('T')[0];

    const AddTransaction = () => {
        const maxID = Math.max(...transactions.map(trans => trans.id));
        newTransaction.id = maxID + 1;
        updateTransactions(newTransaction);
        setTransaction(emptyTransaction);
    };

    return (
        <Card className={styles.inputCard}>
            <div className="col-5">
                <input
                    id="date"
                    className="h-100"
                    type="date"
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => setTransaction({ ...newTransaction, date: e.target.value })}
                    required
                ></input>
            </div>
            <div className="col-5">
                <input
                    id="store"
                    className="h-100"
                    type="text"
                    placeholder="Store/Restaurant"
                    onChange={(e) => setTransaction({ ...newTransaction, store: e.target.value })}
                    required
                ></input>
            </div>
            <div className="col-5">
                <input
                    id="items"
                    className="h-100"
                    type="text"
                    placeholder="What was purchased?"
                    onChange={(e) => setTransaction({ ...newTransaction, items: e.target.value })}
                    required
                ></input>
            </div>
            <div className="col-5">
                <select id="category" className="h-100" 
                onChange={(e) => setTransaction({ ...newTransaction, category: e.target.value })}
                required>
                    <option disabled>Choose a Category...</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                </select>
            </div>
            <div className="col-5">
                <input
                    id="amount"
                    className="h-100"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Amount"
                    onChange={(e) => setTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                    required
                ></input>
            </div>
            <div className="col-2">
                <button className="btn btn-primary" onClick={AddTransaction}>
                    Add
                </button>
            </div>
        </Card>
    );
};

export default InputTransaction;