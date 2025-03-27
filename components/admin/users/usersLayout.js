import useUsers from "@/hooks/useUsers";
import { Container, Table } from "react-bootstrap";
import UsersRow from "./usersRow";
import Loading from "@/components/layout/loading";

const UsersLayout = () => {
    const { users, usersLoading, putUser, deleteUser } = useUsers();

    if (usersLoading)
        return <Loading/>;

    return (
        <Container>
            <Table className="col-12 col-sm-8 col-md-6 col-lg-5 mx-auto">
                <thead>
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
        </Container>
    );
};

export default UsersLayout;