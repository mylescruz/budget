import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import UserModal from "./userModal";
import ConfirmDeleteModal from "./confirmDeleteModal";

const UsersTableRow = ({ user, putUser, deleteUser }) => {
  const [userClicked, setUserClicked] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const openUserModal = () => {
    setUserClicked(true);
  };

  return (
    <>
      <tr className="d-flex">
        <td className="d-none d-md-block col-md-4">{user.name}</td>
        <td className="col-5 col-md-3">{user.username}</td>
        <td className="col-5 col-md-2">{user.role}</td>
        <td className="d-none d-md-block col-md-2">
          {dateFormatter(user.created_date)}
        </td>
        <td
          className="col-2 col-md-1 text-center clicker"
          onClick={openUserModal}
        >
          &#10247;
        </td>
      </tr>

      <UserModal
        user={user}
        userClicked={userClicked}
        setUserClicked={setUserClicked}
        putUser={putUser}
        setConfirmDelete={setConfirmDelete}
      />
      <ConfirmDeleteModal
        user={user}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        deleteUser={deleteUser}
      />
    </>
  );
};

export default UsersTableRow;
