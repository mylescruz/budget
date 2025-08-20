import { Container, Row } from "react-bootstrap";
import OptionsTab from "./optionsTab";
import AccountInfoTab from "./accountInfoTab";
import ChangePasswordTab from "./changePasswordTab";
import { useState } from "react";
import ChangeEmailTab from "./changeEmailTab";
import DeleteAccountTab from "./deleteAccountTab";
import useUser from "@/hooks/useUser";
import Loading from "../layout/loading";

const AccountLayout = () => {
  const [accountSection, setAccountSection] = useState(true);
  const [passwordSection, setPasswordSection] = useState(false);
  const [emailSection, setEmailSection] = useState(false);
  const [deleteSection, setDeleteSection] = useState(false);
  const { user, userLoading, putUser, deleteUser } = useUser();

  const optionsTabProps = {
    accountSection: accountSection,
    setAccountSection: setAccountSection,
    passwordSection: passwordSection,
    setPasswordSection: setPasswordSection,
    emailSection: emailSection,
    setEmailSection: setEmailSection,
    deleteSection: deleteSection,
    setDeleteSection: setDeleteSection,
  };

  if (userLoading) {
    return <Loading />;
  } else {
    return (
      <Container>
        <Row>
          <OptionsTab {...optionsTabProps} />
          {accountSection && <AccountInfoTab user={user} />}
          {passwordSection && (
            <ChangePasswordTab user={user} putUser={putUser} />
          )}
          {emailSection && <ChangeEmailTab user={user} putUser={putUser} />}
          {deleteSection && (
            <DeleteAccountTab user={user} deleteUser={deleteUser} />
          )}
        </Row>
      </Container>
    );
  }
};

export default AccountLayout;
