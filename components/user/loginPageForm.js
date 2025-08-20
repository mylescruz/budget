import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Card, Container, Form, Modal, Spinner } from "react-bootstrap";
import styles from "@/styles/user/loginPage.module.css";
import Link from "next/link";

const LoginPageForm = ({ csrfToken }) => {
  const emptyUser = {
    username: "",
    password: "",
  };

  const newError = {
    error: false,
    message: "",
  };

  const [user, setUser] = useState(emptyUser);
  const [loginError, setLoginError] = useState(newError);
  const [loggingIn, setLoggingIn] = useState(false);
  const router = useRouter();

  const handleInput = (e) => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };

  const loginUser = async (e) => {
    e.preventDefault();

    setLoggingIn(true);

    try {
      const response = await signIn("credentials", {
        username: user.username,
        password: user.password,
        redirect: false,
        csrfToken,
      });

      if (response.ok) {
        router.push("/");
      } else {
        throw new Error("Invalid user credentials. Please try again!");
      }
    } catch (error) {
      setLoginError({ error: true, message: error.message });
    } finally {
      setLoggingIn(false);
    }
  };

  const closeLoggingIn = () => {
    setLoggingIn(false);
  };

  return (
    <>
      <Container className="d-flex justify-content-center align-items-center login">
        <Card className="p-3 col-12 col-sm-10 col-md-6 col-lg-4 card-background">
          <Form onSubmit={loginUser}>
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <Form.Group controlId="username" className="h-100 my-2">
              <Form.Control
                type="text"
                value={user.username}
                placeholder="Username"
                onChange={handleInput}
                required
              />
            </Form.Group>
            <Form.Group controlId="password" className="h-100 my-2">
              <Form.Control
                type="password"
                value={user.password}
                placeholder="Password"
                onChange={handleInput}
                required
              />
            </Form.Group>
            {loginError.error && (
              <p className={styles.error}>{loginError.message}</p>
            )}
            <Button className="btn btn-primary w-100" type="submit">
              Login
            </Button>
          </Form>
          <Link href="/auth/createAccount" className={styles.message}>
            New user? <span className={styles.create}>Create account</span>
          </Link>
        </Card>
      </Container>

      <Modal show={loggingIn} onHide={closeLoggingIn} centered>
        <Modal.Body>
          <h3 className="text-center">Logging In</h3>
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" variant="primary" />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LoginPageForm;
