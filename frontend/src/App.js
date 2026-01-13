import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes } from "./Routes/Routes";
import { AuthProvider } from "./Contexts/AuthContext";
import NotFound from "./Pages/NotFound/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {publicRoutes.map((group, idx) => {
            const Layout = group.layout;

            return (
              <Route key={idx} element={<Layout />}>
                {group.routes.map((r, i) => (
                  <Route key={i} path={r.path} element={r.element} />
                ))}
              </Route>
            );
          })}

          {/* ✅ NOT FOUND – CHỈ 1 LẦN */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;