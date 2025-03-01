import currencyFormatter from "@/helpers/currencyFormatter";
import { useMemo } from "react";
import { Table } from "react-bootstrap";
import PaystubRow from "./paystubRow";

const PaystubTable = ({ paystubs, putPaystub, deletePaystub, yearInfo }) => {
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
        <Table bordered className="mx-auto income-table">
            <caption>*Click a paystub to view the details</caption>
            <thead className="table-dark">
                <tr className="d-flex">
                    <th className="col-3 col-md-2">Date</th>
                    <th className="col-6 col-md-4">Company</th>
                    <th className="d-none d-md-block col-md-2">Gross Income</th>
                    <th className="d-none d-md-block col-md-2">Taxes</th>
                    <th className="col-3 col-md-2">Net Income</th>
                </tr>
            </thead>
            <tbody>
                {paystubs.map(paystub => (
                    <PaystubRow key={paystub.id} paystub={paystub} putPaystub={putPaystub} deletePaystub={deletePaystub} yearInfo={yearInfo} />
                ))}
            </tbody>
            <tfoot>
                <tr className="d-flex">
                    <th className="col-3 col-md-2">Total</th>
                    <th className="col-6 col-md-4"></th>
                    <th className="d-none d-md-block col-md-2">{currencyFormatter.format(footerValues.totalGross)}</th>
                    <th className="d-none d-md-block col-md-2">{currencyFormatter.format(footerValues.totalTaxes)}</th>
                    <th className="col-3 col-md-2">{currencyFormatter.format(footerValues.totalNet)}</th>
                </tr>
            </tfoot>
        </Table>
    );
};

export default PaystubTable;