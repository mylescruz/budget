import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";

const DataTableRow = ({ item, type, openDetails }) => {
  const xsName =
    item.name.length > 15 ? item.name.slice(0, 12) + "..." : item.name;
  const smName =
    item.name.length > 25 ? item.name.slice(0, 22) + "..." : item.name;
  const mdName =
    item.name.length > 30 ? item.name.slice(0, 27) + "..." : item.name;
  const lgName =
    item.name.length > 40 ? item.name.slice(0, 37) + "..." : item.name;

  let amountColor = "text-dark";

  switch (type) {
    case "transactions":
      amountColor = item.amount < 0 && "text-success fw-bold";
      break;
    case "income":
      amountColor = item.amount < 0 && "text-danger fw-bold";
      break;
  }

  return (
    <tr className="d-flex click" onClick={() => openDetails(item._id)}>
      <td className="col-3 col-md-2">{dateFormatter(item.date)}</td>
      <td className="col-6 col-md-5">
        <span className="d-sm-none">{xsName}</span>
        <span className="d-none d-sm-block d-md-none">{smName}</span>
        <span className="d-none d-md-block d-lg-none">{mdName}</span>
        <span className="d-none d-lg-block">{lgName}</span>
      </td>
      <td className="d-none d-md-block col-md-3">{item.type}</td>
      <td className="col-3 col-md-2 text-end">
        <span className={amountColor}>{dollarFormatter(item.amount)}</span>
      </td>
    </tr>
  );
};

export default DataTableRow;
