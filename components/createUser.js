import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";

const CreateUser = () => {
    const emptyUser = {
        username: "",
        email: "",
        name: "",
        password: "",
        confirmPassword: ""
    };

    const validated = {
        valid: true,
        error: ''
    };

    const [newUser, setNewUser] = useState(emptyUser);
    const [validUsername, setValidUsername] = useState(validated);
    const [validEmail, setValidEmail] = useState(validated);
    const [validPassword, setValidPassword] = useState(validated);
    const [validMatch, setValidMatch] = useState(validated);

    const handleInput = (e) => {
        setNewUser({...newUser, [e.target.id]: e.target.value});
    };

    const checkUsername = async (username) => {
        const res = await fetch(`/api/user/${username}`);
        const user = await res.json();
        
        return user.exists;
    };

    const checkEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
        return regex.test(email);
    };

    const checkPassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&*?])[a-zA-Z0-9!@#$%&*?]{8,}$/;
        return regex.test(password);
    };

    const createUserS3 = async (newUser) => {
        try {
            const res = await fetch(`/api/user/${newUser.username}`, {
                method: 'POST',
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            });

            await res.json();
        } catch (err) {
            console.log("Error creating user: ", err);
        }
    };

    const createNewUser = async (e) => {
        e.preventDefault();

        console.log("Creating user");

        // Check if entered email is valid
        if (!checkEmail(newUser.email)) {
            console.log("Didnt pass email check");
            setValidEmail({valid: false, error: 'Not a valid email address'});
            return;
        } else {
            setValidEmail(validated);
        }

        // Check if the username is already taken
        const userExists = await checkUsername(newUser.username);
        if (userExists) {
            console.log("Didnt pass username check");
            setValidUsername({valid: false, error: 'Username is already taken'});
            return;
        } else {
            setValidUsername(validated);
        }

        // Check if entered password is valid
        if (!checkPassword(newUser.password)) {
            console.log("Didnt pass password check");
            setValidPassword({valid: false, error: 'A password must have a minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'});
            return;
        } else {
            setValidPassword(validated);
        }

        // Check if entered password and password confirmation match
        if (newUser.password !== newUser.confirmPassword) {
            console.log("Didnt pass match check");
            setValidMatch({valid: false, error: 'Passwords do not match'});
            return;
        } else {
            setValidMatch(validated);
        }

        // Add the user to S3
        await createUserS3(newUser);

        // Redirect to sign in page
        signIn();
    };

    return (
        <Container className="my-4 col-12 col-sm-8 col-md-6 col-lg-4 col-xl-4">
            <Card>
                <Card.Body>
                    <h4>Create account</h4>  
                    <Form onSubmit={createNewUser}>
                        <Form.Control type="text" id="name" className="h-100 my-2" value={newUser.name} placeholder="Name" onChange={handleInput} required />
                        <Form.Group controlId="email" className="h-100 my-2">
                            <Form.Control type="text" value={newUser.email} placeholder="Email" onChange={handleInput} isInvalid={validEmail.error && !validEmail.valid} required />
                            <Form.Control.Feedback type="invalid">{validEmail.error}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="username" className="h-100 my-2">
                            <Form.Control type="text" value={newUser.username} placeholder="Username" onChange={handleInput} required isInvalid={validUsername.error && !validUsername.valid} />
                            <Form.Control.Feedback type="invalid">{validUsername.error}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="password" className="h-100 my-2">
                            <Form.Control type="password" value={newUser.password} placeholder="Password" onChange={handleInput} required isInvalid={validPassword.error && !validPassword.valid} />
                            <Form.Control.Feedback type="invalid">{validPassword.error}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="confirmPassword" className="h-100 my-2">
                            <Form.Control type="password" value={newUser.confirmPassword} placeholder="Confirm Password" onChange={handleInput} required isInvalid={validMatch.error && !validMatch.valid} />
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
                        <Form.Group className="text-center">
                            <Button type="submit">Sign Up</Button>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateUser;