import { Route, Routes } from "react-router";
import MainPage from "../pages/main-page";
import NoMatchPage from "../pages/no-match-page";
import ContentPage from "../pages/content-page/content-page.tsx";
import AdminPanel from "../pages/admin-panel/admin-panel.tsx";
import LoginPage from "../pages/LoginPage.tsx";
import RequireAuth from "../components/RequireAuth.tsx";
import RegisterPage from "../pages/RegisterPage.tsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/:section/:type" element={<ContentPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/admin-panel"
        element={
          <RequireAuth>
            <AdminPanel />
          </RequireAuth>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NoMatchPage />} />
    </Routes>
  );
};

export default AppRoutes;
