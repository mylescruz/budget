import { Table } from "react-bootstrap";
import PopUp from "../popUp";
import DataTableRow from "./dataTableRow";

const DataTable = ({ sortedArray, columnNames }) => {
  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3 col-md-2">{columnNames.column1}</th>
          <th className="col-6 col-md-5">
            {columnNames.column2}
            <PopUp title="Click a row to view its details." id="row-info">
              <span> &#9432;</span>
            </PopUp>
          </th>
          <th className="d-none d-md-block col-md-3">{columnNames.column3}</th>
          <th className="col-3 col-md-2 text-end">{columnNames.column4}</th>
        </tr>
      </thead>
      <tbody>
        {sortedArray.length === 0 ? (
          <tr>
            <td colSpan={1} className="text-center fw-bold">
              There are no results that match these filters
            </td>
          </tr>
        ) : (
          sortedArray.map((item) => <DataTableRow key={item._id} item={item} />)
        )}
      </tbody>
    </Table>
  );
};

export default DataTable;
