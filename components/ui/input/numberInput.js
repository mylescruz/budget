import { Form } from "react-bootstrap";

const NumberInput = ({
  id,
  label,
  value,
  handleInput,
  min = null,
  max = null,
}) => {
  return (
    <Form.Group controlId={id} className="my-2">
      <Form.Label>
        {label} <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control
        className="h-100"
        type="number"
        value={value}
        onChange={(e) => handleInput(e)}
        min={min}
        max={max}
        required
      />
    </Form.Group>
  );
};

export default NumberInput;
