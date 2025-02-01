import { Col, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";
import useHistory from "@/hooks/useHistory";

const HistoryLayout = () => {
    const { history } = useHistory();

    return (
        <>
            <Row className="content-margin">
                <Col className="text-center"><h1>History</h1></Col>
            </Row>

            <HistoryTable history={history} />
        </>
    );
};

export default HistoryLayout;