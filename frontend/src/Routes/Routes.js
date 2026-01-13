import UserLayout from "../Pages/UserLayout/UserLayout";
import AdminLayout from "../Pages/AdminPage/AdminLayout";

import Home from "../Pages/Home/Home";
import Product from "../Pages/Product/ProductDetail";
import Category from "../Pages/Category/Category";
import Cart from "../Pages/Cart/CartPage";
import Checkout from "../Pages/CheckOut/CheckOut";
import LoginPage from "../Pages/Login/Login";
import RegisterPage from "../Pages/RegisterAccount/RegisterAccount";
import UserProfile from "../Pages/UserProfile/UserProfile";
import OrderHistory from "../Pages/OrderHistory/OrderHistory";
import Admin from "../Pages/AdminPage/AdminPage";
import VerifyOtp from "../Pages/VerifyOtp/VerifyOtp";

export const publicRoutes = [
  // ================= USER LAYOUT =================
  {
    layout: UserLayout,
    routes: [
      { path: "/", element: <Home /> },

      // Product detail
      { path: "/product/:productId", element: <Product /> },

      // ===== CATEGORY ROUTES (FULL) =====
      { path: "/DienThoai", element: <Category category="DienThoai" /> },
      { path: "/DienThoai/:brandName", element: <Category category="DienThoai" /> },

      { path: "/Laptop", element: <Category category="Laptop" /> },
      { path: "/Laptop/:brandName", element: <Category category="Laptop" /> },

      { path: "/TaiNghe", element: <Category category="TaiNghe" /> },
      { path: "/TaiNghe/:brandName", element: <Category category="TaiNghe" /> },

      { path: "/BanPhim", element: <Category category="BanPhim" /> },
      { path: "/BanPhim/:brandName", element: <Category category="BanPhim" /> },

      { path: "/PhuKien", element: <Category category="PhuKien" /> },
      { path: "/PhuKien/:brandName", element: <Category category="PhuKien" /> },

      { path: "/Chuot", element: <Category category="Chuot" /> },
      { path: "/Chuot/:brandName", element: <Category category="Chuot" /> },

      { path: "/Tivi", element: <Category category="Tivi" /> },
      { path: "/Tivi/:brandName", element: <Category category="Tivi" /> },

      { path: "/MayTinhBang", element: <Category category="MayTinhBang" /> },
      { path: "/MayTinhBang/:brandName", element: <Category category="MayTinhBang" /> },

      // ===== USER FEATURES =====
      { path: "/cart", element: <Cart /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/orders", element: <OrderHistory /> },
      { path: "/profile", element: <UserProfile /> },

      // ===== AUTH =====
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-otp", element: <VerifyOtp /> },
    ],
  },

  // ================= ADMIN LAYOUT =================
  {
    layout: AdminLayout,
    routes: [
      { path: "/admin", element: <Admin /> },
    ],
  },
];