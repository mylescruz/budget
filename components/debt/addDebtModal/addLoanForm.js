import { LOAN_TYPE_OPTIONS } from "@/lib/constants/debt";
import { Form } from "react-bootstrap";
import TextInput from "@/components/ui/input/textInput";
import NumberInput from "@/components/ui/input/numberInput";
import DateInput from "@/components/ui/input/dateInput";

const AddLoanForm = ({ debt, setDebt, handleInput }) => {
  const handleLoanType = (e) => {
    setDebt((prev) => ({ ...prev, loanType: e.target.value }));
  };

  return (
    <>
      <Form.Group controlId="loanType" className="my-2">
        <Form.Label>
          What type of loan is this? <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          className="h-100"
          value={debt.loanType}
          onChange={(e) => handleLoanType(e)}
          required
        >
          {LOAN_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <TextInput
        id={"lender"}
        label={"What is the lender's name?"}
        value={debt.lender}
        handleInput={handleInput}
      />
      <NumberInput
        id={"currentBalance"}
        label={"What is the current balance?"}
        value={debt.currentBalance}
        handleInput={handleInput}
        min={0.01}
      />
      <NumberInput
        id={"originalBalance"}
        label={"What was the loan's original balance?"}
        value={debt.originalBalance}
        handleInput={handleInput}
        min={0.01}
      />
      <NumberInput
        id={"apr"}
        label={"What is the Annual Percentage Rate (APR)?"}
        value={debt.apr}
        handleInput={handleInput}
        min={0.01}
      />
      <DateInput
        id={"startDate"}
        label={"When did this loan start?"}
        value={debt.startDate}
        handleInput={handleInput}
      />
      <DateInput
        id={"targetPayoffDate"}
        label={"What is the target payoff date?"}
        value={debt.targetPayoffDate}
        handleInput={handleInput}
      />
      <NumberInput
        id={"monthlyPayment"}
        label={"What is your current monthly payment?"}
        value={debt.monthlyPayment}
        handleInput={handleInput}
        min={0}
      />
      <NumberInput
        id={"dueDate"}
        label={"What day of the month is your payment due?"}
        value={debt.dueDate}
        handleInput={handleInput}
        min={1}
        max={31}
      />
    </>
  );
};

export default AddLoanForm;
