import { ContentItem } from "../components/ContentEditor/ContentEditor";

const getListOfUpdates = async () => {
  try {
    const EXAMPLE_DATA: ContentItem[] = [
      { id: 1, type: "text", src: "Обновление 1" },
      { id: 2, type: "text", src: "Обновление 2" },
      { id: 3, type: "text", src: "Обновление 2" },
      { id: 4, type: "text", src: "Обновление 2" },
      { id: 5, type: "text", src: "Обновление 2" },
      { id: 6, type: "text", src: "Обновление 2" },
      { id: 7, type: "text", src: "Обновление 2" },
      { id: 8, type: "text", src: "Обновление 2" },
      { id: 9, type: "text", src: "Обновление 2" },
      { id: 10, type: "text", src: "Обновление 1" },
      { id: 11, type: "text", src: "Обновление 1" },
      { id: 12, type: "text", src: "Обновление 1" },
      { id: 13, type: "text", src: "Обновление 1" },
      { id: 14, type: "text", src: "Обновление 1" },
      { id: 15, type: "text", src: "Обновление 1" },
      { id: 16, type: "text", src: "Обновление 1" },
      { id: 17, type: "text", src: "Обновление 1" },
      { id: 18, type: "text", src: "Обновление 1" },
      { id: 19, type: "text", src: "Обновление 1" },
      { id: 20, type: "text", src: "Обновление 1" },
      { id: 21, type: "text", src: "Обновление 1" },
      { id: 22, type: "text", src: "Обновление 1" },
      { id: 23, type: "text", src: "Обновление 1" },
      { id: 24, type: "text", src: "Обновление 1" },
    ];

    return EXAMPLE_DATA;
  } catch (error) {
    console.error("❌ Ошибка при отправке на сервер:", error);
  }
};

export default getListOfUpdates;
