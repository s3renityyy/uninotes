import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NoMatchPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, []);
  return <></>;
};

export default NoMatchPage;
