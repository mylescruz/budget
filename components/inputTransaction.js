import categories from "@/helpers/categories";
import { useState } from "react";

const InputTransaction = ({transactions, updateTransactions}) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startOfYear = new Date(`01/01/${currentYear}`);
    const endOfYear = new Date(`12/31/${currentYear}`);
    const minDate = startOfYear.toISOString().split('T')[0];
    const maxDate = endOfYear.toISOString().split('T')[0];

    const emptyTransaction = {
        id: 999,
        date: "",
        store: "",
        items: "",
        category: "",
        amount: 0
    };

    const [newTransaction, setTransaction] = useState(emptyTransaction);

    const AddTransaction = () => {
        const maxID = Math.max(...transactions.map(trans => trans.id));
        newTransaction.id = maxID + 1;
        updateTransactions(newTransaction);
        setTransaction(emptyTransaction);
    };

    return (
        <>
            <div className="card">
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
            </div>
        </>
    );
};

export default InputTransaction;