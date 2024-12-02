import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useMemo } from "react";
import { Table } from "react-bootstrap";

const IncomeTable = ({ paystubs }) => {
    const footerValues = useMemo(() => {
        let totalGross = 0;
        let totalTaxes = 0;
        let totalNet = 0;

        paystubs.forEach(paystub => {
            totalGross += paystub.gross;
            totalTaxes += paystub.taxes;
        });

        totalNet = totalGross - totalTaxes;

        return {totalGross: totalGross, totalTaxes: totalTaxes, totalNet: totalNet};
    }, [paystubs]);

    return (
        <Table bordered className="w-75 mx-auto income-table">
            <thead className="table-dark">
                <tr>
                    <th scope="col">Date Paid</th>
                    <th scope="col">Company</th>
                    <th scope="col">Gross Income</th>
                    <th scope="col">Taxes Deducted</th>
                    <th scope="col">Net Income</th>
                </tr>
            </thead>
            <tbody>
                {paystubs.map(paystub => (
                    <tr key={paystub.id}>
                        <td>{dateFormatter(paystub.date)}</td>
                        <td>{paystub.company}</td>
                        <td>{currencyFormatter.format(paystub.gross)}</td>
                        <td>{currencyFormatter.format(paystub.taxes)}</td>
                        <td>{currencyFormatter.format(paystub.net)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <th scope="col">Total</th>
                    <th scope="col"></th>
                    <th scope="col">{currencyFormatter.format(footerValues.totalGross)}</th>
                    <th scope="col">{currencyFormatter.format(footerValues.totalTaxes)}</th>
                    <th scope="col">{currencyFormatter.format(footerValues.totalNet)}</th>
                </tr>
            </tfoot>
        </Table>
    );
};

export default IncomeTable;