import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContentEditor from "../components/ContentEditor/ContentEditor";
import { ContentItem } from "../components/ContentEditor/ContentEditor";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchPage();
  }, [section, type]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!page) return <div>Страница не найдена</div>;

  const contentItems: ContentItem[] = page.content.map((block, index) => ({
    id: index + Date.now(),
    type: block.type as "text" | "image" | "file",
    src: block.data || block.url || "",
    name: block.caption || "",
  }));

  return (
    <div>
      <h1>{page.title}</h1>
      <p>Раздел: {page.section}</p>
      <p>Обновлено: {new Date(page.updatedAt).toLocaleString()}</p>

      <ContentEditor
        isEditable={true}
        updates={contentItems}
        onContentAdded={fetchPage}
      />
    </div>
  );
};

export default ContentPage;
