import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useRef, useState, useEffect, ChangeEvent } from "react";
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
};

const ContentEditor: React.FC<ContentEditorType> = ({
  isEditable,
  updates,
}) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>(updates);

  useEffect(() => {
    setContentItems(updates);
  }, [updates]);

  const [modalImage, setModalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: "",
  });

  const handleSubmit = () => {
    if (!editor) return;
    const html = editor.getHTML();
    if (!html.trim() || html === "<p></p>") return;

    const newItem: ContentItem = {
      id: Date.now(),
      type: "text",
      src: html,
    };
    setContentItems((prev) => [newItem, ...prev]);
    editor.commands.clearContent();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (file.type.startsWith("image/") && typeof reader.result === "string") {
        const imageSrc = reader.result;
        setContentItems((prev) => [
          { id: Date.now(), type: "image", src: imageSrc },
          ...prev,
        ]);
      } else {
        setContentItems((prev) => [
          { id: Date.now(), type: "file", name: file.name, file },
          ...prev,
        ]);
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
        {contentItems.map((item) => (
          <div key={item.id} className={styles.contentCard}>
            {item.type === "text" && item.src && (
              <div
                className={styles.textBlock}
                dangerouslySetInnerHTML={{ __html: item.src }}
              />
            )}

            {item.type === "image" && item.src && (
              <>
                <img
                  src={item.src}
                  className={styles.contentImage}
                  onClick={() => setModalImage(item.src!)}
                  alt="User uploaded"
                />
              </>
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
