import useUsers from "@/hooks/useUsers";
import { Col, Row, Table } from "react-bootstrap";
import UsersTableRow from "./usersTableRow";
import LoadingIndicator from "@/components/ui/loadingIndicator";

const UsersLayout = () => {
  const { users, usersRequest, putUser, deleteUser } = useUsers();

  if (usersRequest.action === "get" && usersRequest.status === "loading") {
    return <LoadingIndicator message={usersRequest.message} />;
  } else {
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
                {users ? (
                  users.map((user) => (
                    <UsersTableRow
                      key={user.id}
                      user={user}
                      putUser={putUser}
                      deleteUser={deleteUser}
                    />
                  ))
                ) : (
                  <tr className="text-center">
                    <td colSpan={1} className="py-4 text-danger fw-bold">
                      {usersRequest.message}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </>
    );
  }
};

export default UsersLayout;
