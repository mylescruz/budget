import { Col, Form } from "react-bootstrap";

const AccountInfo = ({ user }) => {
    return (
        <Col className="col-12 col-md-8 col-lg-9">
            <h2>{user.name}&#39;s Info</h2>
            <Form className="col-12 col-md-8 col-lg-6 text-start">
                <Form.Group className="my-2">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" defaultValue={user.name} disabled />
                </Form.Group>
                <Form.Group controlId="username" className="my-2">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" defaultValue={user.username} disabled />
                </Form.Group>
                <Form.Group controlId="email" className="my-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" defaultValue={user.email} disabled />
                </Form.Group>
            </Form>
        </Col>
    )
};

export default AccountInfo;