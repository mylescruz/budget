import { Container, Row } from "react-bootstrap";
import OptionsTab from "./optionsTab";
import AccountInfoTab from "./accountInfoTab";
import ChangePasswordTab from "./changePasswordTab";
import { useState } from "react";
import ChangeEmailTab from "./changeEmailTab";
import DeleteAccountTab from "./deleteAccountTab";
import useUser from "@/hooks/useUser";
import LoadingIndicator from "../ui/loadingIndicator";

const AccountLayout = () => {
  const [section, setSection] = useState("account");

  const { user, userRequest, putUser, deleteUser } = useUser();

  if (userRequest.action === "get" && userRequest.status === "loading") {
    return <LoadingIndicator message={userRequest.message} />;
  } else {
    return (
      <Container>
        <Row>
          <OptionsTab section={section} setSection={setSection} />
          {section === "account" && (
            <AccountInfoTab user={user} userRequest={userRequest} />
          )}
          {section === "password" && (
            <ChangePasswordTab user={user} putUser={putUser} />
          )}
          {section === "email" && (
            <ChangeEmailTab user={user} putUser={putUser} />
          )}
          {section === "delete" && (
            <DeleteAccountTab
              user={user}
              deleteUser={deleteUser}
              userRequest={userRequest}
            />
          )}
        </Row>
      </Container>
    );
  }
};

export default AccountLayout;
