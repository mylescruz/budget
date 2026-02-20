import { Dropdown } from "react-bootstrap";
import styles from "@/styles/layout/dataTableLayout/dataTableLayout.module.css";

const DataTableSortDropdown = ({ sortOptions, sortOption, setSortOption }) => {
  return (
    <Dropdown className="text-end">
      <Dropdown.Toggle variant="dark">Sort</Dropdown.Toggle>
      <Dropdown.Menu className={styles.menu}>
        {sortOptions.map((option) => (
          <Dropdown.Item
            key={option}
            className={sortOption === option ? "bg-primary text-white" : ""}
            onClick={() => {
              setSortOption(option);
            }}
          >
            {option}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DataTableSortDropdown;
