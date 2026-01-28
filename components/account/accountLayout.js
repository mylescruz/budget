import { Container, Row } from "react-bootstrap";
import OptionsTab from "./optionsTab";
import AccountInfoTab from "./accountInfoTab";
import ChangePasswordTab from "./changePasswordTab";
import { useState } from "react";
import ChangeEmailTab from "./changeEmailTab";
import DeleteAccountTab from "./deleteAccountTab";
import useUser from "@/hooks/useUser";
import LoadingIndicator from "../layout/loadingIndicator";

const AccountLayout = () => {
  const [section, setSection] = useState("account");

  const { user, userLoading, putUser, deleteUser } = useUser();

  if (userLoading) {
    return <LoadingIndicator />;
  } else if (!user) {
    return (
      <Row className="mt-4 text-center">
        <p className="fw-bold text-danger">
          &#9432; There was an error loading your information. Please try again
          later!
        </p>
      </Row>
    );
  } else {
    return (
      <Container>
        <Row>
          <OptionsTab section={section} setSection={setSection} />
          {section === "account" && <AccountInfoTab user={user} />}
          {section === "password" && (
            <ChangePasswordTab user={user} putUser={putUser} />
          )}
          {section === "email" && (
            <ChangeEmailTab user={user} putUser={putUser} />
          )}
          {section === "delete" && (
            <DeleteAccountTab user={user} deleteUser={deleteUser} />
          )}
        </Row>
      </Container>
    );
  }
};

export default AccountLayout;
