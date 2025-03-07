import { Spinner } from "react-bootstrap";

export default function Loading() {
    return (
        <div className="d-flex justify-content-center align-items-center loading-spinner">
            <Spinner animation="border" variant="primary"/>
        </div>
    );
};