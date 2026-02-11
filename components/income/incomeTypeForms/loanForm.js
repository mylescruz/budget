import { Form } from "react-bootstrap";

const LoanForm = ({ source, handleInput, year }) => {
  return (
    <>
      <Form.Group className="my-3">
        <Form.Label>What day did your loan get disbursed?</Form.Label>
        <Form.Control
          id="date"
          className="h-100"
          type="date"
          min={`${year}-01-01`}
          max={`${year}-12-31`}
          value={source.date}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-3">
        <Form.Label>Who is your loan provider?</Form.Label>
        <Form.Control
          id="name"
          className="h-100"
          type="text"
          value={source.name}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-3">
        <Form.Label>Loan Amount</Form.Label>
        <Form.Control
          id="amount"
          className="h-100"
          type="number"
          min={0.01}
          step={0.01}
          value={source.amount}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="mt-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          id="description"
          className="h-100"
          type="text"
          value={source.description}
          onChange={handleInput}
        />
      </Form.Group>
    </>
  );
};

export default LoanForm;
