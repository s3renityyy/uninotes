import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type ContentBlock = {
  type: string;
  data?: string;
  url?: string;
  caption?: string;
};

type PageData = {
  section: string;
  type: string;
  title: string;
  content: ContentBlock[];
  updatedAt: string;
};

const ContentPage: React.FC = () => {
  const { section, type } = useParams<{ section: string; type: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!section || !type) return;
      try {
        const response = await fetch(`/api/${section}/${type}`);
        if (!response.ok) {
          throw new Error("Не удалось загрузить страницу");
        }
        const data = await response.json();
        setPage(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [section, type]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!page) return <div>Страница не найдена</div>;

  return (
    <div>
      <h1>{page.title}</h1>
      <p>Раздел: {page.section}</p>
      <p>Обновлено: {new Date(page.updatedAt).toLocaleString()}</p>
      <div>
        {page.content.map((block, index) => {
          switch (block.type) {
            case "text":
              return <p key={index}>{block.data}</p>;
            case "image":
              return (
                <div key={index}>
                  <img src={block.url} alt={block.caption || "Изображение"} />
                  {block.caption && <p>{block.caption}</p>}
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default ContentPage;
