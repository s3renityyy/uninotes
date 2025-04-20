import { Route, Routes } from "react-router";
import MainPage from "../pages/MainPage.tsx/MainPage.tsx";
import NoMatchPage from "../pages/no-match-page";
import ContentPage from "../pages/content-page/content-page.tsx";
import AdminLoginPage from "../pages/AdminLoginPage/AdminLoginPage.tsx";
import AdminPage from "../pages/AdminPage/AdminPage.tsx";
import RequireAuthAdmin from "../components/RequireAuthAdmin.tsx";
import ContentDisplay from "../components/ContentDisplay/ContentDisplay.tsx";

interface AppRoutesProps {}

const AppRoutes: React.FC<AppRoutesProps> = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/:section/:type" element={<ContentPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuthAdmin path="/admin/login">
            <AdminPage />
          </RequireAuthAdmin>
        }
      />
      <Route path="/:section/:type/show" element={<ContentDisplay />}></Route>
      <Route path="*" element={<NoMatchPage />} />
    </Routes>
  );
};

export default AppRoutes;
