import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Update = {
  section: string;
  type: string;
  title: string;
  updatedAt: string;
};

const HomePage: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch("/api/updates");
        if (!response.ok) {
          throw new Error("Не удалось загрузить обновления");
        }
        const data = await response.json();
        setUpdates(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      <h1>Последние обновления</h1>
      <ul>
        {updates.map((item) => (
          <li key={`${item.section}-${item.type}`}>
            <Link to={`/${item.section}/${item.type}`}>
              <strong>{item.title}</strong> (Обновлено:{" "}
              {new Date(item.updatedAt).toLocaleString()})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
