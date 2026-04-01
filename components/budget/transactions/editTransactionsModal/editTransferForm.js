import {
  TRANSFER_ACCOUNTS,
  TRANSFER_ACCOUNTS_LIST,
} from "@/lib/constants/transactions";
import { Form } from "react-bootstrap";

const EditTransferForm = ({ dateInfo, transaction, handleInput }) => {
  return (
    <>
      <Form.Group controlId="date" className="my-3">
        <Form.Label>Date of the transfer</Form.Label>
        <Form.Control
          className="h-100"
          type="date"
          min={dateInfo.startOfMonth}
          max={dateInfo.endOfMonth}
          value={transaction.date}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group controlId="fromAccount" className="my-3">
        <Form.Label>Transfer From</Form.Label>
        <Form.Select
          className="h-100"
          value={transaction.fromAccount}
          onChange={handleInput}
          required
        >
          {TRANSFER_ACCOUNTS_LIST.map((account) => (
            <option key={account} value={account}>
              {account}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="toAccount" className="my-3">
        <Form.Label>Transfer To</Form.Label>
        <Form.Select
          className="h-100"
          value={transaction.toAccount}
          onChange={handleInput}
          required
        >
          {TRANSFER_ACCOUNTS_LIST.filter(
            (account) => account !== TRANSFER_ACCOUNTS.LOAN,
          ).map((account) => (
            <option key={account} value={account}>
              {account}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="amount" className="my-3">
        <Form.Label>Amount transferred</Form.Label>
        <Form.Control
          className="h-100"
          type="number"
          step="0.01"
          value={transaction.amount}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group controlId="description" className="my-3">
        <Form.Label>Reason for transfer</Form.Label>
        <Form.Control
          className="h-100"
          type="text"
          value={transaction.description}
          onChange={handleInput}
        />
      </Form.Group>
    </>
  );
};

export default EditTransferForm;
