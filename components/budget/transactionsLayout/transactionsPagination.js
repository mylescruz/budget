const TransactionsPagination = ({ page, setPage, totalPages }) => {
  const previousPage = () => {
    if (page !== 1) {
      setPage(page - 1);
    }
  };

  const nextPage = () => {
    if (page !== totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="mx-auto d-flex flex-row align-items-center justify-content-between mt-2 col-12 col-md-4 col-lg-3 col-xl-2">
      <i className="bi bi-chevron-left clicker" onClick={previousPage} />
      <div className="small text-muted">
        {page} / {totalPages}
      </div>
      <i className="bi bi-chevron-right clicker" onClick={nextPage} />
    </div>
  );
};

export default TransactionsPagination;
