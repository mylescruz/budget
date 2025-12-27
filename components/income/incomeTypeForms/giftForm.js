import { Form } from "react-bootstrap";

const GiftForm = ({ source, handleInput, year }) => {
  return (
    <>
      <Form.Group className="my-2">
        <Form.Label>What day did you receive this gift?</Form.Label>
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
      <Form.Group className="my-2">
        <Form.Label>Who gave you this gift?</Form.Label>
        <Form.Control
          id="name"
          className="h-100"
          type="text"
          value={source.name}
          placeholder="Gift Giver's Name"
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-2">
        <Form.Label>How much did they give you?</Form.Label>
        <Form.Control
          id="amount"
          className="h-100"
          type="number"
          min={0.01}
          step={0.01}
          placeholder="Amount"
          value={source.amount}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-2">
        <Form.Label>Description</Form.Label>
        <Form.Control
          id="description"
          className="h-100"
          type="text"
          value={source.description}
          placeholder="Optional"
          onChange={handleInput}
        />
      </Form.Group>
    </>
  );
};

export default GiftForm;
