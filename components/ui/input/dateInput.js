import { Form } from "react-bootstrap";

const DateInput = ({ id, label, value, handleInput }) => {
  return (
    <Form.Group controlId={id} className="my-2">
      <Form.Label>
        {label} <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control
        className="h-100"
        type="date"
        value={value}
        onChange={(e) => handleInput(e)}
        required
      />
    </Form.Group>
  );
};

export default DateInput;
