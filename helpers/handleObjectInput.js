const handleObjectInput = ({ e, setObject }) => {
  setObject((prev) => ({ ...prev, [e.target.id]: e.target.value }));
};

export default handleObjectInput;
