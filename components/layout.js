import Footer from "./footer";
import Header from "./header";

export default function Layout({ children }) {
    return (
        <div className="page-layout">
            <Header/>
            <main className="content">
                {children}
            </main>
            <Footer/>
        </div>
    );
};