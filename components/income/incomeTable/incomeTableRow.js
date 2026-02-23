import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";

const IncomeTableRow = ({ source, setChosenSource, setModal }) => {
  const openDetailsModal = () => {
    setChosenSource(source);

    setModal("incomeDetails");
  };

  return (
    <tr className="d-flex click" onClick={openDetailsModal}>
      <td className="col-3 col-md-2">{dateFormatter(source.date)}</td>
      <td className="col-6 col-md-5">
        <>
          <span className="d-sm-none">
            {source.name.length > 15
              ? source.name.slice(0, 15) + "..."
              : source.name}
          </span>
          <span className="d-none d-sm-block d-md-none">
            {source.name.length > 25
              ? source.name.slice(0, 25) + "..."
              : source.name}
          </span>
          <span className="d-none d-md-block d-lg-none">
            {source.name.length > 30
              ? source.name.slice(0, 30) + "..."
              : source.name}
          </span>
          <span className="d-none d-lg-block">
            {source.name.length > 40
              ? source.name.slice(0, 40) + "..."
              : source.name}
          </span>
        </>
      </td>
      <td className="d-none d-md-block col-md-3">{source.type}</td>
      <td className="col-3 col-md-2 text-end">
        {dollarFormatter(source.amount)}
      </td>
    </tr>
  );
};

export default IncomeTableRow;
