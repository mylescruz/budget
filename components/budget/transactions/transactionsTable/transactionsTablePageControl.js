import { Button, Col, Row } from "react-bootstrap";

const TransactionsTablePageControl = ({ page, setPage, totalPages }) => {
  const previousPage = () => {
    setPage(page - 1);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  return (
    <Row className="d-flex col-12 col-md-6 col-lg-4 justify-items-between mx-auto align-items-center text-center">
      <Col className="col-3">
        <Button
          onClick={previousPage}
          size="sm"
          className="btn-dark fw-bold"
          disabled={page === 1 || page === 0}
        >
          &#60;
        </Button>
      </Col>
      <Col className="col-6">
        <h4 className="p-0 m-0 fw-bold">
          {page}/{totalPages}
        </h4>
      </Col>
      <Col className="col-3">
        <Button
          onClick={nextPage}
          size="sm"
          className="btn-dark fw-bold"
          disabled={page === totalPages}
        >
          &#62;
        </Button>
      </Col>
    </Row>
  );
};

export default TransactionsTablePageControl;
