import useUsers from "@/hooks/useUsers";
import { Col, Container, Row, Table } from "react-bootstrap";
import UsersRow from "./usersRow";
import Loading from "@/components/layout/loading";

const UsersLayout = () => {
    const { users, usersLoading, putUser, deleteUser } = useUsers();

    if (usersLoading)
        return <Loading/>;

    return (
        <>
            <aside className="info-text text-center mx-auto">
                <h1>Users</h1>
                <p>View and manage the users in this app.</p>
            </aside>

            <Row className="d-flex">
                <Col className="col-11 col-md-10 col-xl-8 mx-auto">
                    <Table striped>
                        <thead className="table-dark">
                            <tr className="d-flex">
                                <th className="d-none d-md-block col-md-4">User</th>
                                <th className="col-5 col-md-3">Username</th>
                                <th className="col-5 col-md-2">Role</th>
                                <th className="d-none d-md-block col-md-2">Created</th>
                                <th className="col-2 col-md-1"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <UsersRow key={user.id} user={user} putUser={putUser} deleteUser={deleteUser} />
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    );
};

export default UsersLayout;