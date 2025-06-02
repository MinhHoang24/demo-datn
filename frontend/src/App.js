import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './Routes/Routes';
import { CartProvider } from './Contexts/CartContext';
import { AuthProvider } from './Contexts/AuthContext';
import "antd/dist/reset.css"; // "antd/dist/antd.css"

function App() {
  return (
    <>
    <AuthProvider>
      <BrowserRouter>
          <CartProvider>
            <Routes>
            {publicRoutes.map((route, index) => {
              const Page = route.component
              const Layout = route.layout
              let category = route.category

              return (
                <Route key={index} path={route.path} element={
                  <Layout>
                    <Page category={category}></Page>
                  </Layout>
                }>
                  <Route path={route.childPath} element={
                  <Layout>
                    <Page category={category}></Page>
                  </Layout>
                }> </Route>
                </Route>
              )
            })}
          </Routes>
          </CartProvider>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;