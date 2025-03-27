import { Container, Row } from "react-bootstrap";
import OptionsTab from "./optionsTab";
import AccountInfo from "./accountInfo";
import ChangePassword from "./changePassword";
import { useState } from "react";
import ChangeEmail from "./changeEmail";
import DeleteAccount from "./deleteAccount";
import useUser from "@/hooks/useUser";

const AccountLayout = () => {
    const [accountSection, setAccountSection] = useState(true);
    const [passwordSection, setPasswordSection] = useState(false);
    const [emailSection, setEmailSection] = useState(false);
    const [deleteSection, setDeleteSection] = useState(false);
    const { user, putUser, deleteUser } = useUser();

    const optionsTabProps = {
        accountSection: accountSection,
        setAccountSection: setAccountSection,
        passwordSection:  passwordSection,
        setPasswordSection:  setPasswordSection,
        emailSection: emailSection,
        setEmailSection: setEmailSection,
        deleteSection: deleteSection,
        setDeleteSection: setDeleteSection
    };

    return (
        <Container>
            <Row>
                <OptionsTab {...optionsTabProps} />
                {accountSection && <AccountInfo user={user} />}
                {passwordSection && <ChangePassword user={user} putUser={putUser} />}
                {emailSection && <ChangeEmail user={user} putUser={putUser} />}
                {deleteSection && <DeleteAccount user={user} deleteUser={deleteUser} />}
            </Row>
        </Container>
    );
};

export default AccountLayout;