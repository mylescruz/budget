import { Col, Row } from "react-bootstrap";
import styles from "@/styles/account/optionsTab.module.css";

const OptionsTab = ({ accountSection, setAccountSection, passwordSection, setPasswordSection, emailSection, setEmailSection, deleteSection, setDeleteSection }) => {
    const openAccount = () => {
        setAccountSection(true);
        setPasswordSection(false);
        setEmailSection(false);
        setDeleteSection(false);
    };

    const openPassword = () => {
        setPasswordSection(true);
        setAccountSection(false);
        setEmailSection(false);
        setDeleteSection(false);
    };

    const openUsername = () => {
        setAccountSection(false);
        setPasswordSection(false);
        setEmailSection(false);
        setDeleteSection(false);
    };

    const openEmail = () => {
        setEmailSection(true);
        setAccountSection(false);
        setPasswordSection(false);
        setDeleteSection(false);
    };

    const openDelete = () => {
        setDeleteSection(true);
        setAccountSection(false);
        setPasswordSection(false);
        setEmailSection(false);
    };

    return (
        <Col className="col-12 col-md-4 col-lg-3">
            <Row onClick={openAccount} className={`clicker ${styles.options} ${accountSection && styles.active}`}>
                Account Info
            </Row>
            <Row onClick={openPassword} className={`clicker ${styles.options} ${passwordSection && styles.active}`}>
                Change password
            </Row>
            <Row onClick={openEmail} className={`clicker ${styles.options} ${emailSection && styles.active}`}>
                Change email
            </Row>
            <Row onClick={openDelete} className={`clicker ${styles.options} ${deleteSection && styles.active}`}>
                Delete account
            </Row>
        </Col>
    );
};

export default OptionsTab;