import currencyFormatter from "@/helpers/currencyFormatter";
import { useMemo } from "react";
import { Table } from "react-bootstrap";
import PaystubRow from "./paystubRow";

const PaystubTable = ({ paystubs, editOldPaystub }) => {
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
                    <th scope="col">Date</th>
                    <th scope="col">Company</th>
                    <th scope="col">Gross Income</th>
                    <th scope="col">Taxes Deducted</th>
                    <th scope="col">Net Income</th>
                </tr>
            </thead>
            <tbody>
                {paystubs.map(paystub => (
                    <PaystubRow key={paystub.id} paystub={paystub} editOldPaystub={editOldPaystub} />
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

export default PaystubTable;