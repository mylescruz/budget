import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { Container, Modal, Row } from "react-bootstrap";

const TransactionDetails = ({transaction, showDetails, setDetails}) => {
    const closeDetails = () => {
        setDetails(false);
    };

    return (
        <Modal show={showDetails} onHide={closeDetails} centered>
            <Modal.Header closeButton>
                <Modal.Title>Transaction Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row>
                        Date: {dateFormatter(transaction.date)}
                    </Row>
                    <Row>
                        Store: {transaction.store}
                    </Row>
                    <Row>
                        Items Purchased: {transaction.items}
                    </Row>
                    <Row>
                        Category: {transaction.category}
                    </Row>
                    <Row>
                        Amount: {currencyFormatter.format(transaction.amount)}
                    </Row>
                </Container>
            </Modal.Body>
        </Modal>
    );
};

export default TransactionDetails;