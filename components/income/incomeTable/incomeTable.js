import { Table } from "react-bootstrap";
import IncomeTableRow from "./incomeTableRow";
import PopUp from "@/components/layout/popUp";

const IncomeTable = ({ sortedIncome, year, putIncome, deleteIncome }) => {
  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3 col-md-2">Date</th>
          <th className="col-6 col-md-5">
            Source
            <PopUp
              title="Click a source of income to view its details."
              id="source-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
          <th className="d-none d-md-block col-md-3">Type</th>
          <th className="col-3 col-md-2 text-end">Amount</th>
        </tr>
      </thead>
      <tbody>
        {sortedIncome.length === 0 ? (
          <tr>
            <td colSpan={1} className="text-center fw-bold">
              There is no income that match these filters
            </td>
          </tr>
        ) : (
          sortedIncome.map((source) => (
            <IncomeTableRow
              key={source._id}
              source={source}
              putIncome={putIncome}
              deleteIncome={deleteIncome}
              year={year}
            />
          ))
        )}
      </tbody>
    </Table>
  );
};

export default IncomeTable;
