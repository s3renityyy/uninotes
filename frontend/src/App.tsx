import React from "react";
import MenuComponent from "./components/MenuComponent/MenuComponent";
import { useEffect } from "react";
import { useRoutesStore } from "./store/useRoutesStore";

export interface PageRoute {
  section: string;
  type: string;
  title: string;
}

const App: React.FC = () => {
  const fetchRoutes = useRoutesStore((s) => s.fetchRoutes);

  useEffect(() => {
    fetchRoutes();
  }, []);

  return <MenuComponent />;
};

export default App;
