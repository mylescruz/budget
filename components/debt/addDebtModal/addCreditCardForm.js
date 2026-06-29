import NumberInput from "@/components/ui/input/numberInput";
import TextInput from "@/components/ui/input/textInput";

const AddCreditCardForm = ({ debt, handleInput }) => {
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
      <NumberInput
        id={"apr"}
        label={"What is the Annual Percentage Rate (APR)?"}
        value={debt.apr}
        handleInput={handleInput}
        min={0.01}
      />
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
