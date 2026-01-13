import { Outlet } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";

function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-[80px] flex-1 relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;