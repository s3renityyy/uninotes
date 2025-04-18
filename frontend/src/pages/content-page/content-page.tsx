import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContentEditor, {
  ContentItem,
} from "../../components/ContentEditor/ContentEditor";
import styles from "./content-page.module.scss";
import RequireAuthAdmin from "../../components/RequireAuthAdmin";

type ContentBlock = {
  _id: string;
  type: string;
  data?: string;
  url?: string;
  caption?: string;
  dateAdded?: string;
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

  const contentItems: ContentItem[] = page.content
    .slice(1)
    .reverse()
    .map((block) => ({
      id: block._id,
      type: block.type as "text" | "image" | "file",
      src: block.data || block.url || "",
      name: block.caption || "",
    }));

  return (
    <div>
      <header className={styles.header}>{page.title}</header>
      <RequireAuthAdmin>
        <ContentEditor
          isEditable={Boolean(localStorage.getItem("isAdmin"))}
          updates={contentItems}
          onContentAdded={fetchPage}
        />
      </RequireAuthAdmin>
    </div>
  );
};

export default ContentPage;
