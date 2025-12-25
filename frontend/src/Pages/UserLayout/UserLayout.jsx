import Footer from "../../Components/Footer/Footer";
import Header from "../../Components/Header/Header";

function userLayout({children}){
    return (
        <div className="min-h-screen">
            <Header />

            <main className="pt-[80px]">
                {children}
            </main>

            <Footer />
        </div>
    );
}
export default userLayout;