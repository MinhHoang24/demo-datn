import Footer from "../../Components/Footer/Footer";
import Header from "../../Components/Header/Header";

function userLayout({children}){
    return(
        <div>
            <Header />
            {children}
            <Footer />
        </div>
    )
}
export default userLayout;