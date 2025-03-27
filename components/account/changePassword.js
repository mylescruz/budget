import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Col, Form } from "react-bootstrap";

const ChangePassword = ({ user, putUser }) => {
    const oldUser = {
        ...user,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    };

    // Error validation object that checks if an object is valid and returns an error if not
    const validated = {
        valid: true,
        error: ''
    };

    const [edittedUser, setEdittedUser] = useState(oldUser);
    const [validPassword, setValidPassword] = useState(validated);
    const [validMatch, setValidMatch] = useState(validated);
    const router = useRouter();

    const handleInput = (e) => {
        setEdittedUser({...edittedUser, [e.target.id]: e.target.value});
    };

    // Checks if the given password matches the required format
    const checkPassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&*?])[a-zA-Z0-9!@#$%&*?]{8,}$/;
        return regex.test(password);
    };

    // Does all the validation checks to make sure the given input matches all the criteria
    const updatePassword = async (e) => {
        e.preventDefault();

        // Check if entered password is valid
        if (!checkPassword(edittedUser.newPassword)) {
            setValidPassword({valid: false, error: 'A password must have a minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'});
            return;
        } else {
            setValidPassword(validated);
        }

        // Check if entered password and password confirmation match
        if (edittedUser.newPassword !== edittedUser.confirmPassword) {
            setValidMatch({valid: false, error: 'Passwords do not match'});
            return;
        } else {
            setValidMatch(validated);
        }

        try {
            // Add the user to S3
            await putUser(edittedUser);

            setEdittedUser(oldUser);
            
            window.alert("Your password was updated.");

            router.reload();
        } catch (error) {
            window.alert(error.message);
        }
    };

    return (
        <>
            <Col className="col-12 col-md-8 col-lg-9">
                <h2>Change Password</h2>

                <Form onSubmit={updatePassword} className="col-12 col-md-8 col-lg-6">
                    <Form.Group controlId="currentPassword" className="my-2">
                        <Form.Label>Enter Current Password</Form.Label>
                        <Form.Control type="password" value={edittedUser.currentPassword} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group controlId="newPassword" className="my-2">
                        <Form.Label>Enter New Password</Form.Label>
                        <Form.Control type="password" value={edittedUser.newPassword} onChange={handleInput} required isInvalid={validPassword.error && !validPassword.valid} />
                        <Form.Control.Feedback type="invalid">{validPassword.error}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="confirmPassword" className="my-2">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control type="password" value={edittedUser.confirmPassword} onChange={handleInput} required isInvalid={validMatch.error && !validMatch.valid} />
                        <Form.Control.Feedback type="invalid">{validMatch.error}</Form.Control.Feedback>
                        <Form.Text>
                            Your password must include: <br/>
                            <ul>
                                <li>An uppercase letter</li>
                                <li>A lowercase letter</li>
                                <li>A number</li>
                                <li>A special character: !@#$%&*?</li>
                                <li>Minimum 8 characters</li>
                            </ul>
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className="my-2 text-end">
                        <Button type="submit">Change</Button>
                    </Form.Group>
                </Form>
            </Col>
        </>
    );
};

export default ChangePassword;