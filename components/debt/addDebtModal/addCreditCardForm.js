import DateInput from "@/components/ui/input/dateInput";
import NumberInput from "@/components/ui/input/numberInput";
import TextInput from "@/components/ui/input/textInput";
import { Form } from "react-bootstrap";

const AddCreditCardForm = ({ debt, setDebt, handleInput }) => {
  const handlePromo = (e) => {
    const value = e.target.value === "true";

    setDebt((prev) => ({
      ...prev,
      hasPromoAPR: value,
    }));
  };

  return (
    <>
      <TextInput
        id={"lender"}
        label={"Who is the credit card servicer?"}
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
        id={"creditLimit"}
        label={"What is the card's credit limit?"}
        value={debt.creditLimit}
        handleInput={handleInput}
        min={0.01}
      />
      <Form.Group controlId="hasPromoAPR" className="my-2">
        <Form.Label>
          Is there a promotional APR on this card?{" "}
          <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          className={"h-100"}
          value={debt.hasPromoAPR}
          onChange={(e) => handlePromo(e)}
          required
        >
          <option value={false}>No</option>
          <option value={true}>Yes</option>
        </Form.Select>
      </Form.Group>
      {!debt.hasPromoAPR ? (
        <>
          <NumberInput
            id={"apr"}
            label={"What is the Annual Percentage Rate (APR)?"}
            value={debt.apr}
            handleInput={handleInput}
            min={0.01}
          />
        </>
      ) : (
        <>
          <NumberInput
            id={"promoAPR"}
            label={"What is the promotional Annual Percentage Rate (APR)?"}
            value={debt.promoAPR}
            handleInput={handleInput}
            min={0.01}
          />
          <DateInput
            id={"promoAPREndDate"}
            label={"When is the promotion's end date?"}
            value={debt.promoAPREndDate}
            handleInput={handleInput}
          />
          <>
            <NumberInput
              id={"apr"}
              label={"What will the APR be when the promotion ends?"}
              value={debt.apr}
              handleInput={handleInput}
              min={0.01}
            />
          </>
        </>
      )}
      <NumberInput
        id={"monthlyPayment"}
        label={"What is your current monthly payment?"}
        value={debt.monthlyPayment}
        handleInput={handleInput}
        min={0}
      />
    </>
  );
};

export default AddCreditCardForm;
