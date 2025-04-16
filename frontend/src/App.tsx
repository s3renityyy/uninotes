import React from "react";
import { Routes, Route } from "react-router-dom";
import MenuComponent from "./components/MenuComponent/MenuComponent";
import MainPage from "./pages/main-page";
import ContentPage from "./pages/content-page";

const App: React.FC = () => {
  return (
    <div>
      <MenuComponent />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path=":section/:type" element={<ContentPage />} />
      </Routes>
    </div>
  );
};

export default App;
