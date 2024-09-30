import categories from "@/helpers/categories";

const InputTransaction = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startOfYear = new Date(`01/01/${currentYear}`);
    const endOfYear = new Date(`12/31/${currentYear}`);

    const minDate = startOfYear.toISOString().split('T')[0];
    const maxDate = endOfYear.toISOString().split('T')[0];

    const emptyTransaction = {
        date: currentDate,
        store: "Store Name",
        items: "Item(s)",
        category: "Miscellaneous",
        amount: 0
    };

    let newTransaction = emptyTransaction;

    const handleUserInput = (e) => {
        console.log("Before: ", newTransaction[e.target.id]);
        newTransaction[e.target.id] = e.target.value;
        console.log("After: ", newTransaction[e.target.id]);
    }

    const onTransactionSubmitClick = () => {
        console.log(newTransaction.date);
        console.log(newTransaction.store);
        console.log(newTransaction.items);
        console.log(newTransaction.category);
        console.log(newTransaction.amount);
    };

    return (
        <div className="card">
            <div className="col-5">
                <input
                    id="date"
                    className="h-100"
                    type="date"
                    min={minDate}
                    max={maxDate}
                    onChange={handleUserInput}
                    required
                ></input>
            </div>
            <div className="col-5">
                <input
                    id="store"
                    className="h-100"
                    type="text"
                    placeholder="Store/Restaurant"
                    onChange={handleUserInput}
                    required
                ></input>
            </div>
            <div className="col-5">
                <input
                    id="items"
                    className="h-100"
                    type="text"
                    placeholder="What was purchased?"
                    onChange={handleUserInput}
                    required
                ></input>
            </div>
            <div className="col-5">
                <select id="category" className="h-100" onChange={handleUserInput} required>
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
                    onChange={handleUserInput}
                    required
                ></input>
            </div>
            <div className="col-2">
                <button className="btn btn-primary" onClick={onTransactionSubmitClick}>
                    Add
                </button>
            </div>
        </div>
    );
};

export default InputTransaction;