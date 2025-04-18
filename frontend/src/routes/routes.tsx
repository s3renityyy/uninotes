import { Route, Routes } from "react-router";
import MainPage from "../pages/main-page";
import NoMatchPage from "../pages/no-match-page";
import ContentPage from "../pages/content-page/content-page.tsx";
import AdminLoginPage from "../pages/AdminLoginPage/AdminLoginPage.tsx";
import LoginPage from "../pages/LoginPage.tsx";
import RequireAuth from "../components/RequireAuth.tsx";
import RegisterPage from "../pages/RegisterPage.tsx";
import AdminPage from "../pages/AdminPage/AdminPage.tsx";
import RequireAuthAdmin from "../components/RequireAuthAdmin.tsx";
import ContentDisplay from "../components/ContentDisplay/ContentDisplay.tsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/:section/:type" element={<ContentPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/admin/login"
        element={
          <RequireAuth>
            <AdminLoginPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuthAdmin path="/admin/login">
            <AdminPage />
          </RequireAuthAdmin>
        }
      />
      <Route path="/:section/:type/show" element={<ContentDisplay />}></Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NoMatchPage />} />
    </Routes>
  );
};

export default AppRoutes;
