import { Form } from "react-bootstrap";

const DataTableSearchBar = ({ searchInput, setSearchInput }) => {
  const handleInput = (e) => {
    setSearchInput(e.target.value);
  };

  return (
    <Form.Group controlId="searchInput">
      <Form.Control
        type="text"
        value={searchInput}
        placeholder="Search"
        onChange={handleInput}
      />
    </Form.Group>
  );
};

export default DataTableSearchBar;
