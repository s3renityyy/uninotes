import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../Button/Button";
import styles from "./ContentEditor.module.scss";

interface ContentItem {
  id: string;
  text?: string;
  file?: File;
  image?: string;
  timestamp: number;
}

const sendToBackend = async (item: ContentItem) => {
  try {
    const response = await fetch("https://uni-help.up.railway.app/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    const result = await response.json();
    console.log("✅ Ответ сервера:", result);
  } catch (error) {
    console.error("❌ Ошибка при отправке на сервер:", error);
  }
};

const ContentEditor = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pages, setPages] = useState<ContentItem[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const updatePage = (page: number) => {
    setSearchParams({ page: String(page) }, { replace: true });
  };

  const handleAddText = async () => {
    setError(null);

    if (!text.trim()) {
      setError("Поле не должно быть пустым");
      return;
    }

    if (text.length > 3000) {
      setError("Превышен лимит в 3000 символов");
      return;
    }

    const newItem: ContentItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
    };

    setIsSubmitting(true);
    await sendToBackend(newItem);
    setIsSubmitting(false);

    setContent((prev) => [newItem, ...prev]);
    setText("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent((prev) => [
            {
              id: Date.now().toString(),
              image: e.target?.result as string,
              timestamp: Date.now(),
            },
            ...prev,
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setContent((prev) => [
          {
            id: Date.now().toString(),
            file,
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      }
    }
  };

  useEffect(() => {
    paginateContent();
  }, [content]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const paginateContent = () => {
    if (!contentRef.current) return;

    const containerHeight = contentRef.current.clientHeight;
    const items: ContentItem[][] = [];
    let page: ContentItem[] = [];
    let heightSum = 0;

    const dummy = document.createElement("div");
    dummy.style.position = "absolute";
    dummy.style.visibility = "hidden";
    dummy.style.width = `${contentRef.current.clientWidth}px`;
    dummy.className = styles.contentCard;
    document.body.appendChild(dummy);

    for (const item of content) {
      dummy.innerHTML = "";

      if (item.text) {
        const p = document.createElement("p");
        p.textContent = item.text;
        dummy.appendChild(p);
      } else if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.style.maxHeight = "400px";
        dummy.appendChild(img);
      } else if (item.file) {
        const div = document.createElement("div");
        div.textContent = `Файл: ${item.file.name}`;
        dummy.appendChild(div);
      }

      const estimatedHeight = dummy.offsetHeight + 32;

      if (heightSum + estimatedHeight > containerHeight && page.length > 0) {
        items.push(page);
        page = [];
        heightSum = 0;
      }

      page.push(item);
      heightSum += estimatedHeight;
    }

    if (page.length) items.push(page);

    document.body.removeChild(dummy);
    setPages(items);

    if (currentPage > items.length && items.length > 0) {
      updatePage(1);
    }
  };

  const currentItems = pages[currentPage - 1] || [];

  const renderPagination = () => {
    const total = pages.length;
    const pageLinks = [];
    const visiblePages = 5;
    let start = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let end = Math.min(total, start + visiblePages - 1);

    if (end - start < visiblePages - 1) {
      start = Math.max(1, end - visiblePages + 1);
    }

    if (start > 1) pageLinks.push(<span key="start">...</span>);

    for (let i = start; i <= end; i++) {
      pageLinks.push(
        <button
          key={i}
          className={`${styles.pageLink} ${
            i === currentPage ? styles.active : ""
          }`}
          onClick={() => updatePage(i)}
        >
          {i}
        </button>
      );
    }

    if (end < total) pageLinks.push(<span key="end">...</span>);

    return <div className={styles.pagination}>{pageLinks}</div>;
  };

  return (
    <div className={styles.contentEditor}>
      <div className={styles.contentControls}>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст..."
          className={`${styles.textArea} ${error ? styles.error : ""}`}
        />
        {error && <div className={styles.errorText}>{error}</div>}

        <div className={styles.buttonGroup}>
          <Button
            onClick={handleAddText}
            className={styles.addButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Добавить текст"}
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            style={{ display: "none" }}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            className={styles.uploadButton}
          >
            Загрузить файл/фото
          </Button>
        </div>
      </div>

      <div ref={contentRef} className={styles.contentDisplay}>
        {currentItems.map((item) => (
          <div key={item.id} className={styles.contentCard}>
            {item.text && <p className={styles.contentText}>{item.text}</p>}
            {item.image && (
              <img
                src={item.image}
                alt="Uploaded content"
                className={styles.contentImage}
              />
            )}
            {item.file && (
              <div className={styles.fileContainer}>
                <p>Файл: {item.file.name}</p>
                <Button
                  className={styles.fileButton}
                  onClick={() => {
                    const url = URL.createObjectURL(item.file!);
                    window.open(url, "_blank");
                  }}
                >
                  Просмотреть
                </Button>
              </div>
            )}
            <div className={styles.timestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {pages.length > 1 && renderPagination()}
    </div>
  );
};

export default ContentEditor;
