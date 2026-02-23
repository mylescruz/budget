import { Table } from "react-bootstrap";
import PopUp from "../popUp";
import DataTableRow from "./dataTableRow";

const DataTable = ({ sortedData, columns, openDetails, editable }) => {
  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3 col-md-2">{columns.column1}</th>
          <th className="col-6 col-md-5">
            {columns.column2}
            <PopUp title="Click a row to view its details." id="row-info">
              <span> &#9432;</span>
            </PopUp>
          </th>
          <th className="d-none d-md-block col-md-3">{columns.column3}</th>
          <th className="col-3 col-md-2 text-end">{columns.column4}</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.length === 0 ? (
          <tr>
            <td colSpan={1} className="text-center fw-bold">
              There are no results that match these filters
            </td>
          </tr>
        ) : (
          sortedData.map((item) => (
            <DataTableRow
              key={item._id}
              item={item}
              openDetails={openDetails}
              editable={editable}
            />
          ))
        )}
      </tbody>
    </Table>
  );
};

export default DataTable;
