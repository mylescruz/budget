import { Table } from "react-bootstrap";
import PopUp from "../popUp";
import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";

const DataTable = ({ sortedArray, columnNames }) => {
  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3 col-md-2">{columnNames.column1}</th>
          <th className="col-6 col-md-5">
            {columnNames.column2}
            <PopUp title="Click a row to view its details." id="source-info">
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
          sortedArray.map((elem) => (
            <tr className="d-flex">
              <td className="col-3 col-md-2">{dateFormatter(elem.date)}</td>
              <td className="col-6 col-md-5">
                <>
                  <span className="d-sm-none">
                    {elem.name.length > 15
                      ? elem.name.slice(0, 15) + "..."
                      : elem.name}
                  </span>
                  <span className="d-none d-sm-block d-md-none">
                    {elem.name.length > 25
                      ? elem.name.slice(0, 25) + "..."
                      : elem.name}
                  </span>
                  <span className="d-none d-md-block d-lg-none">
                    {elem.name.length > 30
                      ? elem.name.slice(0, 30) + "..."
                      : elem.name}
                  </span>
                  <span className="d-none d-lg-block">
                    {elem.name.length > 40
                      ? elem.name.slice(0, 40) + "..."
                      : elem.name}
                  </span>
                </>
              </td>
              <td className="d-none d-md-block col-md-3">{elem.type}</td>
              <td className="col-3 col-md-2 text-end">
                {dollarFormatter(elem.amount)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default DataTable;
