import { transferAccounts } from "@/lib/constants/transactions";
import { Form } from "react-bootstrap";

const AddTransferForm = ({ dateInfo, transaction, handleInput, index }) => {
  return (
    <>
      <Form.Group controlId="date" className="my-2">
        <Form.Label>
          Date of the transfer <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          className="h-100"
          type="date"
          min={dateInfo.startOfMonth}
          max={dateInfo.endOfMonth}
          value={transaction.date}
          onChange={(e) => handleInput(e, index)}
          required
        />
      </Form.Group>
      <Form.Group controlId="fromAccount" className="my-2">
        <Form.Label>
          Transfer From <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          className="h-100"
          value={transaction.fromAccount}
          onChange={(e) => handleInput(e, index)}
          required
        >
          {transferAccounts.map((account) => (
            <option key={account} value={account}>
              {account}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="toAccount" className="my-2">
        <Form.Label>
          Transfer To <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          className="h-100"
          value={transaction.toAccount}
          onChange={(e) => handleInput(e, index)}
          required
        >
          {transferAccounts
            .filter((account) => account !== "Loan")
            .map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="amount" className="my-2">
        <Form.Label>
          Amount transferred <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          className="h-100"
          type="number"
          step="0.01"
          value={transaction.amount}
          onChange={(e) => handleInput(e, index)}
          required
        />
      </Form.Group>
      <Form.Group controlId="description" className="my-2">
        <Form.Label>
          Transfer description <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          className="h-100"
          type="text"
          value={transaction.description}
          onChange={(e) => handleInput(e, index)}
          required
        />
      </Form.Group>
    </>
  );
};

export default AddTransferForm;
