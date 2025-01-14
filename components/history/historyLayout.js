import { Col, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";

const HistoryLayout = () => {
    return (
        <>
            <Row className="content-margin">
                <Col className="text-center"><h1>History</h1></Col>
            </Row>

            <HistoryTable />
        </>
    );
};

export default HistoryLayout;