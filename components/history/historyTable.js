import dateInfo from "@/helpers/dateInfo";
import useSummary from "@/hooks/useSummary";
import { useState } from "react";
import { Table } from "react-bootstrap";

const HistoryTable = () => {
    const { summary } = useSummary();

    return (
        <Table bordered className="w-75 mx-auto">
            <thead className="table-dark">
                <tr>
                    <th scope="col">Month</th>
                    <th scope="col">Budget</th>
                    <th scope="col">Actual</th>
                    <th scope="col">Leftover</th>
                </tr>
            </thead>
            <tbody>
                {summary.map(month => (
                    <tr key={month.id}>
                        <td>{month.month} {month.year}</td>
                        <td>{month.budget}</td>
                        <td>{month.spent}</td>
                        <td>{month.leftover}</td>
                    </tr>
                ))}                
            </tbody>
        </Table>
    );
};

export default HistoryTable;