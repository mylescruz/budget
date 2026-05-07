import {
  TRANSFER_ACCOUNTS,
  TRANSFER_ACCOUNTS_LIST,
} from "@/lib/constants/transactions";
import { useMemo } from "react";
import { Form } from "react-bootstrap";

const AddTransferForm = ({ dateInfo, transaction, handleInput, index }) => {
  // Define the transfer each type of account can make
  const transferToList = useMemo(() => {
    return TRANSFER_ACCOUNTS_LIST.filter((account) => {
      // Loan accounts can only transfer to checking
      if (transaction.fromAccount === TRANSFER_ACCOUNTS.LOAN) {
        return account === TRANSFER_ACCOUNTS.CHECKING;
      }

      // Don't allow the user to transfer to a loan account or the same account they chose to transfer from
      return (
        account !== TRANSFER_ACCOUNTS.LOAN &&
        account !== transaction.fromAccount
      );
    });
  }, [transaction.fromAccount]);

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
          {TRANSFER_ACCOUNTS_LIST.map((account) => (
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
          {transferToList.map((account) => (
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
