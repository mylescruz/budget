import { Col, Row, Table } from "react-bootstrap";

export default function ErrorTransactionsTable() {
  return (
    <Row className="d-flex">
      <Col className="col-12 col-xl-10 mx-auto">
        <Table>
          <thead className="table-dark">
            <tr className="d-flex">
              <th className="col-3 col-md-2 col-lg-1">Date</th>
              <th className="col-6 col-md-5 col-lg-4">Store</th>
              <th className="d-none d-lg-block col-lg-4">Items</th>
              <th className="d-none d-md-block col-md-3 col-lg-2">Category</th>
              <th className="col-3 col-md-2 col-lg-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={1} className="text-danger fw-bold text-center">
                &#9432; There was an error loading your transactions. Please try
                again later!
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>
    </Row>
  );
}
