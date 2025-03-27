import { Container} from "react-bootstrap";
import AccountInfo from "./accountInfo";
import { useSession } from "next-auth/react";

const AccountLayout = () => {
    const { data: session } = useSession();

    return (
        <Container className="my-4">
            <AccountInfo session={session} />
        </Container>
    )
};

export default AccountLayout;