import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Register = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/me")
      .then(() => navigate("/"))
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/register", { username, password });
      localStorage.setItem("user", "true");
      navigate("/admin");
    } catch (err) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const message =
          (err as any).response?.data?.message || "Ошибка регистрации";
        alert(message);
      } else {
        alert("Произошла неизвестная ошибка");
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl mb-4">Регистрация</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="username"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white py-2 rounded">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

export default Register;
