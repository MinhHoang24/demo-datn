import Home from '../Pages/Home/Home';
import Product from '../Pages/Product/ProductDetail';
import RegisterPage from '../Pages/RegisterAccount/RegisterAccount';
import LoginPage from '../Pages/Login/Login';
import Admin from '../Pages/AdminPage/AdminPage';
import userLayout from '../Pages/UserLayout/UserLayout';
import adminLayout from '../Pages/AdminPage/AdminLayout';
import Category from '../Pages/Category/Category'
import UserProfile from '../Pages/UserProfile/UserProfile';
import CheckOrder from '../Pages/CheckOrder/CheckOrder';
import Checkout from '../Pages/CheckOut/CheckOut';
import Cart from '../Pages/Cart/CartPage';

// public Routes
const publicRoutes=[
    {path: '/admin', component:Admin, layout: adminLayout},
    {path: '/', component: Home, layout: userLayout},
    {path: '/product', component: Product, layout: userLayout, childPath: ':productId'},
    {path: '/register', component:RegisterPage, layout: userLayout},
    {path: '/login', component:LoginPage, layout: userLayout},
    {path: '/DienThoai', component: Category, layout: userLayout, childPath: ':brandName', category: 'DienThoai'},
    {path: '/Laptop', component: Category, layout: userLayout, childPath: ':brandName', category: 'Laptop'},
    {path: '/TaiNghe', component: Category, layout: userLayout, childPath: ':brandName', category: 'TaiNghe'},
    {path: '/BanPhim', component: Category, layout: userLayout, childPath: ':brandName', category: 'BanPhim'},
    {path: '/PhuKien', component: Category, layout: userLayout, childPath: ':brandName', category: 'PhuKien'},
    {path: '/Chuot', component: Category, layout: userLayout, childPath: ':brandName', category: 'Chuot'},
    {path: '/Tivi', component: Category, layout: userLayout, childPath: ':brandName', category: 'Tivi'},

    {path: '/profile',component: UserProfile, layout: userLayout},
    {path: '/cart', component: Cart, layout: userLayout },
    {path: '/checkout', component: Checkout, layout: userLayout},
    {path: '/checkorder', component: CheckOrder, layout: userLayout},
];

const privateRoutes=[
    
];

export {
    publicRoutes, privateRoutes
}