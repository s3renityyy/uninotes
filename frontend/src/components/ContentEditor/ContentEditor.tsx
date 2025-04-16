import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useRef, useState, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import styles from "./ContentEditor.module.scss";
import Modal from "../Modal/Modal";

export interface ContentItem {
  id: string;
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
      const fileSrc = reader.result;
      if (!section || !type) return;

      await fetch(`/api/${section}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: file.type.startsWith("image/") ? "image" : "file",
          url: fileSrc,
          caption: file.name,
        }),
      });

      onContentAdded();
    };
    reader.readAsDataURL(file);
  };

  const deleteContent = async (contentId: string) => {
    await fetch(`/api/${section}/${type}/${contentId}`, { method: "DELETE" });
    onContentAdded();
  };

  const editContent = async (contentId: string, newData: string) => {
    await fetch(`/api/${section}/${type}/${contentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: newData, caption: "" }),
    });
    onContentAdded();
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
              <>
                <div className={styles["contentCard-text"]}>
                  <div dangerouslySetInnerHTML={{ __html: item.src }} />
                  {localStorage.getItem("isAdmin") && (
                    <div className={styles["contentCard-text-images"]}>
                      <img
                        className={styles["contentCard-text-images-trash"]}
                        src="/trash.svg"
                        alt=""
                        onClick={() => deleteContent(item.id)}
                      />
                      <img
                        src="/edit.svg"
                        alt=""
                        className={styles["contentCard-text-images-edit"]}
                        onClick={() => {
                          const newData = prompt("Измените текст:", item.src);
                          if (newData) editContent(item.id, newData);
                        }}
                      ></img>
                    </div>
                  )}
                </div>
              </>
            )}
            {item.type === "image" && item.src && (
              <div className={styles["contentCard-image"]}>
                <img
                  src={item.src}
                  className={styles.contentImage}
                  onClick={() => setModalImage(item.src!)}
                  alt="User uploaded"
                />
                {localStorage.getItem("isAdmin") && (
                  <div className={styles["contentCard-text-images"]}>
                    <img
                      className={styles["contentCard-text-images-trash"]}
                      src="/trash.svg"
                      alt=""
                      onClick={() => deleteContent(item.id)}
                    />
                  </div>
                )}
              </div>
            )}
            {item.type === "file" && item.src && (
              <div className={styles["contentCard-image"]}>
                <a href={item.src} download={item.name}>
                  {item.name}
                </a>
                {localStorage.getItem("isAdmin") && (
                  <div className={styles["contentCard-text-images"]}>
                    <img
                      className={styles["contentCard-text-images-trash"]}
                      src="/trash.svg"
                      alt=""
                      onClick={() => deleteContent(item.id)}
                    />
                  </div>
                )}
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
