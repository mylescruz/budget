import { Button } from "react-bootstrap";

const DataTablePages = ({ page, setPage, totalPages }) => {
  const previousPage = () => {
    setPage(page - 1);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  return (
    <div className="mx-auto d-flex flex-row align-items-center justify-content-between col-12 col-md-4 col-lg-3 col-xl-2">
      <Button
        onClick={previousPage}
        size="sm"
        className="btn-dark fw-bold"
        disabled={page === 1}
      >
        &#60;
      </Button>
      <div>
        <h5 className="p-0 m-0 fw-bold">
          {page}/{totalPages}
        </h5>
      </div>
      <Button
        onClick={nextPage}
        size="sm"
        className="btn-dark fw-bold"
        disabled={page === totalPages}
      >
        &#62;
      </Button>
    </div>
  );
};

export default DataTablePages;
