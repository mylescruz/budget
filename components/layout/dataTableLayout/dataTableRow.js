import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";

const DataTableRow = ({ item, openDetails, editable }) => {
  const xsName =
    item.name.length > 15 ? item.name.slice(0, 12) + "..." : item.name;
  const smName =
    item.name.length > 25 ? item.name.slice(0, 22) + "..." : item.name;
  const mdName =
    item.name.length > 30 ? item.name.slice(0, 27) + "..." : item.name;
  const lgName =
    item.name.length > 40 ? item.name.slice(0, 27) + "..." : item.name;

  return (
    <tr
      className={`d-flex ${editable ? "click" : ""} `}
      onClick={editable ? () => openDetails(item._id) : undefined}
    >
      <td className="col-3 col-md-2">{dateFormatter(item.date)}</td>
      <td className="col-6 col-md-5">
        <span className="d-sm-none">{xsName}</span>
        <span className="d-none d-sm-block d-md-none">{smName}</span>
        <span className="d-none d-md-block d-lg-none">{mdName}</span>
        <span className="d-none d-lg-block">{lgName}</span>
      </td>
      <td className="d-none d-md-block col-md-3">{item.type}</td>
      <td className="col-3 col-md-2 text-end">
        {dollarFormatter(item.amount)}
      </td>
    </tr>
  );
};

export default DataTableRow;
