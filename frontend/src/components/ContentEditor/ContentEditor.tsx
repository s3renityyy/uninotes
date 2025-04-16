import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useRef, useState, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import styles from "./ContentEditor.module.scss";
import Modal from "../Modal/Modal";

export interface ContentItem {
  id: number;
  type: "image" | "file" | "text";
  src?: string;
  name?: string;
  file?: File;
}

type ContentEditorType = {
  isEditable: boolean;
  updates: ContentItem[];
  onContentAdded: () => void;
};

const ContentEditor: React.FC<ContentEditorType> = ({
  isEditable,
  updates,
  onContentAdded,
}) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const { section, type } = useParams<{ section: string; type: string }>();

  const [modalImage, setModalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: "",
  });

  const handleSubmit = async () => {
    if (!editor) return;
    const html = editor.getHTML();
    if (!html.trim() || html === "<p></p>") return;

    try {
      if (!section || !type) throw new Error("Section или type не определены.");

      const response = await fetch(`/api/${section}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", data: html }),
      });
      if (!response.ok) throw new Error("Не удалось добавить контент");

      editor.commands.clearContent();
      await onContentAdded();
    } catch (err: any) {
      console.error("Ошибка при отправке контента:", err);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (file.type.startsWith("image/") && typeof reader.result === "string") {
        const imageSrc = reader.result;
        const newItem: ContentItem = {
          id: Date.now(),
          type: "image",
          src: imageSrc,
        };

        try {
          if (!section || !type)
            throw new Error("Section или type не определены.");
          const response = await fetch(`/api/${section}/${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "image", url: imageSrc, caption: "" }),
          });
          if (!response.ok) {
            throw new Error("Не удалось добавить изображение");
          }
          const result = await response.json();
          console.log("Изображение успешно добавлено:", result);
          setContentItems((prev) => [newItem, ...prev]);
        } catch (err: any) {
          console.error("Ошибка при отправке изображения:", err);
        }
      } else {
        const newItem: ContentItem = {
          id: Date.now(),
          type: "file",
          name: file.name,
          file,
        };
        setContentItems((prev) => [newItem, ...prev]);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.contentEditor}>
      {isEditable && (
        <>
          <button
            className={styles["contentEditor-loadImage"]}
            onClick={handleUploadClick}
          >
            Загрузить изображение/файл
          </button>

          <EditorContent
            editor={editor}
            className={styles.editorArea}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </>
      )}

      <div className={styles.contentDisplay}>
        {updates.map((item) => (
          <div key={item.id} className={styles.contentCard}>
            {item.type === "text" && item.src && (
              <div
                className={styles.textBlock}
                dangerouslySetInnerHTML={{ __html: item.src }}
              />
            )}
            {item.type === "image" && item.src && (
              <img
                src={item.src}
                className={styles.contentImage}
                onClick={() => setModalImage(item.src!)}
                alt="User uploaded"
              />
            )}
            {item.type === "file" && item.file && (
              <div>
                <a
                  className={styles.contentFile}
                  href={URL.createObjectURL(item.file)}
                  download={item.name}
                >
                  {item.name}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalImage && (
        <Modal isOpen={true} closeModal={() => setModalImage(null)}>
          <img src={modalImage} className={styles.fullImage} alt="Modal view" />
        </Modal>
      )}
    </div>
  );
};

export default ContentEditor;
