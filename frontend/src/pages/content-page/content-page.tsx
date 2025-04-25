import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentEditor, {
  ContentItem,
} from "../../components/ContentEditor/ContentEditor";
import styles from "./content-page.module.scss";
import RequireAuthAdmin from "../../components/RequireAuthAdmin";
import { FileItem } from "../../components/ContentEditor/ContentEditor";

type ContentBlock = {
  id: string;
  dateAdded: string;
  files?: FileItem[];
  text?: string;
};

type PageData = {
  section: string;
  type: string;
  sectionTitle: string;
  typeTitle: string;
  content: ContentBlock[];
  updatedAt: string;
  _id: string;
};

const ContentPage: React.FC = () => {
  const { section, type } = useParams<{ section: string; type: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPage = async () => {
    if (!section || !type) return;
    try {
      const response = await fetch(`/api/${section}/${type}`);
      if (!response.ok) {
        navigate("/");
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

  const contentItems: ContentItem[] = page.content.map((block) => ({
    id: block.id,
    dateAdded: block.dateAdded,
    text: block.text,
    files: block.files,
  }));

  return (
    <div>
      <header
        className={styles.header}
      >{`${page.sectionTitle} (${page.typeTitle})`}</header>
      <RequireAuthAdmin path={`/${section}/${type}/show`}>
        <ContentEditor updates={contentItems} onContentAdded={fetchPage} />
      </RequireAuthAdmin>
    </div>
  );
};

export default ContentPage;
