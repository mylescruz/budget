import { signIn } from "next-auth/react";
import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import Link from "next/link";
import CategoryPieChart from "../budget/categoryPieChart";
import currencyFormatter from "@/helpers/currencyFormatter";
import styles from "@/styles/home/home.module.css";

const Home = () => {
    // A user accesses the login page using the signIn function provided by NextAuth.js
    const userSignIn = async () => {
        await signIn({ callbackUrl: '/'});
    };

    const exampleCategories = [
        {
            id: 0,
            name: "Mortgage",
            actual: 2000,
            color: "#3058e8",
            style: {
                backgroundColor: "#3058e8",
                border: "#3058e8"
            }
        },
        {
            id: 1,
            name: "Insurances",
            actual: 750,
            color: "#e83030",
            style: {
                backgroundColor: "#e83030",
                border: "#e83030"
            }
        },
        {
            id: 2,
            name: "Internet",
            actual: 200,
            color: "#920381",
            style: {
                backgroundColor: "#920381",
                border: "#920381"
            }
        },
        {
            id: 3,
            name: "Subscriptions",
            actual: 50,
            color: "#137a03",
            style: {
                backgroundColor: "#137a03",
                border: "#137a03"
            }
        }
    ];

    return (
        <Container>
            <Card className="col-12 mx-auto card-background">
                <Card.Body>
                    <Row>
                        <Col className="col-12 col-lg-6 mt-3">
                            <h1 className="fw-bold">The budgeting app for your Type-A personality</h1>
                            <h5 className="my-3">A budget for people who want to manually track their income and spending down to the cent.</h5>
                            <h5>Login or sign up to see where you&#39;re allocating your money!</h5>
                        </Col>
                        <Col className="col-12 col-lg-6">
                            <Row className="d-flex align-items-center">
                                <Col className="col-12 col-md-6 col-lg-5 col-xl-6">
                                    <CategoryPieChart categories={exampleCategories} />
                                </Col>
                                <Col className="col-12 col-md-6 col-lg-7 col-xl-6">
                                    <Table borderless>
                                        <thead>
                                            <tr className={`d-flex ${styles.grayBackground}`}>
                                                <th className={`col-6 col-lg-7 col-xl-6 ${styles.grayBackground}`}>Category</th>
                                                <th className={`col-6 col-lg-5 col-xl-6 text-end fw-bold ${styles.grayBackground}`}>Spent</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exampleCategories.map(category => (
                                                <tr key={category.id} className="d-flex">
                                                    <td className={`col-6 col-lg-7 col-xl-6 ${styles.grayBackground}`}>
                                                        <Button style={category.style} className="btn-sm fw-bold">{category.name}</Button>
                                                    </td>
                                                    <td className={`col-6 col-lg-5 col-xl-6 text-end fw-bold ${styles.grayBackground}`}>
                                                        {currencyFormatter.format(category.actual)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    
                    <Row className="text-center my-3">
                        <Col>
                            <Button variant="dark" onClick={userSignIn}>Login</Button>
                        </Col>
                        <Col>
                            <Button as={Link} href="/auth/createAccount" variant="primary">Sign up</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Home;