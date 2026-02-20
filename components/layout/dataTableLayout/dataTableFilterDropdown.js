import { Dropdown } from "react-bootstrap";
import styles from "@/styles/layout/dataTableLayout/dataTableLayout.module.css";

const DataTableFilterDropdown = ({
  filterOptions,
  filterOption,
  setFilterOption,
}) => {
  return (
    <Dropdown className="text-start text-md-end">
      <Dropdown.Toggle variant="dark">Filter</Dropdown.Toggle>
      <Dropdown.Menu className={styles.menu}>
        {filterOptions.map((option) => (
          <Dropdown.Item
            key={option}
            className={filterOption === option ? "bg-primary text-white" : ""}
            onClick={() => {
              setFilterOption(option);
            }}
          >
            {option}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DataTableFilterDropdown;
