import { Route, Routes } from "react-router";
import MainPage from "../pages/main-page";
import NoMatchPage from "../pages/no-match-page";
import ContentPage from "../pages/content-page.tsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/:section/:type" element={<ContentPage />} />
      <Route path="*" element={<NoMatchPage />} />
    </Routes>
  );
};

export default AppRoutes;
