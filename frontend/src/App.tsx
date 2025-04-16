import React from "react";
import { Routes, Route } from "react-router-dom";
import MenuComponent from "./components/MenuComponent/MenuComponent";
import MainPage from "./pages/main-page";
import ContentPage from "./pages/content-page";

const App: React.FC = () => {
  return <MenuComponent />;
};

export default App;
