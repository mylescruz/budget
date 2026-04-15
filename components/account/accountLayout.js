import { Col, Container, Row } from "react-bootstrap";
import AccountInfoTab from "./accountInfoTab";
import ChangePasswordTab from "./changePasswordTab";
import { useState } from "react";
import ChangeEmailTab from "./changeEmailTab";
import DeleteAccountTab from "./deleteAccountTab";
import useUser from "@/hooks/useUser";
import LoadingIndicator from "../ui/loadingIndicator";
import styles from "@/styles/account/accountLayout.module.css";

const AccountLayout = () => {
  const [tab, setTab] = useState("ACCOUNT");

  const { user, userRequest, putUser, deleteUser } = useUser();

  // Sections for user to interact with
  const TABS = {
    ACCOUNT: {
      title: "Account Info",
      display: <AccountInfoTab user={user} userRequest={userRequest} />,
    },
    PASSWORD: {
      title: "Change Password",
      display: <ChangePasswordTab user={user} putUser={putUser} />,
    },
    EMAIL: {
      title: "Change Email",
      display: <ChangeEmailTab user={user} putUser={putUser} />,
    },
    DELETE: {
      title: "Delete Account",
      display: (
        <DeleteAccountTab
          user={user}
          deleteUser={deleteUser}
          userRequest={userRequest}
        />
      ),
    },
  };

  // The current tab being displayed
  const DISPLAY = TABS[tab].display;

  if (userRequest.action === "get" && userRequest.status === "loading") {
    return <LoadingIndicator message={userRequest.message} />;
  } else {
    return (
      <Container>
        <Row>
          <Col className="col-12 col-md-3">
            {Object.entries(TABS).map(([key, value]) => (
              <div
                key={key}
                onClick={() => setTab(key)}
                className={`clicker ${styles.options} ${tab === key && styles.active}`}
              >
                {value.title}
              </div>
            ))}
          </Col>
          <Col className="col-12 col-md-9">{DISPLAY}</Col>
        </Row>
      </Container>
    );
  }
};

export default AccountLayout;
