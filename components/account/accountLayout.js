import { Container} from "react-bootstrap";
import AccountInfo from "./accountInfo";
import useUser from "@/hooks/useUser";

const AccountLayout = () => {
    const { user } = useUser();

    return (
        <Container className="my-4">
            <AccountInfo user={user} />
        </Container>
    )
};

export default AccountLayout;