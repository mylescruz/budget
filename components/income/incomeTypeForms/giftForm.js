import { Form } from "react-bootstrap";

const GiftForm = ({ src, handleInput, year }) => {
  return (
    <>
      <Form.Group className="my-3">
        <Form.Label>What day did you receive this gift?</Form.Label>
        <Form.Control
          id="date"
          className="h-100"
          type="date"
          min={`${year}-01-01`}
          max={`${year}-12-31`}
          value={src.date}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-3">
        <Form.Label>Who gave you this gift?</Form.Label>
        <Form.Control
          id="source"
          className="h-100"
          type="text"
          value={src.source}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-3">
        <Form.Label>How much did they give you?</Form.Label>
        <Form.Control
          id="amount"
          className="h-100"
          type="number"
          min={0.01}
          step={0.01}
          value={src.amount}
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
          value={src.description}
          placeholder="Optional"
          onChange={handleInput}
        />
      </Form.Group>
    </>
  );
};

export default GiftForm;
