import { Col, Row } from "react-bootstrap";
import styles from "@/styles/account/optionsTab.module.css";

const OptionsTab = ({ section, setSection }) => {
  const openAccount = () => {
    setSection("account");
  };

  const openPassword = () => {
    setSection("password");
  };

  const openEmail = () => {
    setSection("email");
  };

  const openDelete = () => {
    setSection("delete");
  };

  return (
    <Col className="col-12 col-md-4 col-lg-3">
      <Row
        onClick={openAccount}
        className={`clicker ${styles.options} ${section === "account" && styles.active}`}
      >
        Account Info
      </Row>
      <Row
        onClick={openPassword}
        className={`clicker ${styles.options} ${section === "password" && styles.active}`}
      >
        Change password
      </Row>
      <Row
        onClick={openEmail}
        className={`clicker ${styles.options} ${section === "email" && styles.active}`}
      >
        Change email
      </Row>
      <Row
        onClick={openDelete}
        className={`clicker ${styles.options} ${section === "delete" && styles.active}`}
      >
        Delete account
      </Row>
    </Col>
  );
};

export default OptionsTab;
