import { Route, Routes } from "react-router";
import MainPage from "../pages/main-page";
import NoMatchPage from "../pages/no-match-page";
import AlgorithmsLab from "../pages/algorithmsLab";
import AlgorithmsNotes from "../pages/algorithmsNotes";
import EdpmLab from "../pages/edpmLab";
import EdpmNotes from "../pages/edpmNotes";

const AppRoutes = () => {
  const navigationRoutes = [
    { path: "/", element: <MainPage /> },
    { path: "/tryhackme", element: <AlgorithmsLab /> },
    { path: "/algorithms/lab", element: <AlgorithmsLab /> },
    { path: "/algorithms/notes", element: <AlgorithmsNotes /> },
    { path: "/edpm/lab", element: <EdpmLab /> },
    { path: "/edpm/notes", element: <EdpmNotes /> },
    { path: "*", element: <NoMatchPage /> },
  ];

  return (
    <Routes>
      {navigationRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};

export default AppRoutes;
