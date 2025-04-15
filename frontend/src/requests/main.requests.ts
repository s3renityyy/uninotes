import { ContentItem } from "../components/ContentEditor/ContentEditor";

const getListOfUpdates = async () => {
  try {
    const EXAMPLE_DATA: ContentItem[] = [
      { id: "1", text: "Обновление 1", timestamp: 1753123123312 },
      { id: "2", text: "Обновление 2", timestamp: 2 },
      { id: "3", text: "Обновление 3", timestamp: 3 },
      { id: "4", text: "Обновление 4", timestamp: 4 },
      { id: "5", text: "Обновление 5", timestamp: 1 },
      { id: "6", text: "Обновление 6", timestamp: 2 },
      { id: "7", text: "Обновление 7", timestamp: 3 },
      { id: "8", text: "Обновление 8", timestamp: 4 },
      { id: "9", text: "Обновление 9", timestamp: 1 },
      { id: "10", text: "Обновление 10", timestamp: 2 },
      { id: "11", text: "Обновление 11", timestamp: 3 },
      { id: "12", text: "Обновление 12", timestamp: 4 },
      { id: "13", text: "Обновление 13", timestamp: 1 },
      { id: "14", text: "Обновление 14", timestamp: 2 },
      { id: "15", text: "Обновление 15", timestamp: 3 },
      { id: "16", text: "Обновление 16", timestamp: 4 },
      { id: "17", text: "Обновление 17", timestamp: 1 },
      { id: "18", text: "Обновление 18", timestamp: 2 },
      { id: "19", text: "Обновление 19", timestamp: 3 },
      { id: "20", text: "Обновление 20", timestamp: 4 },
      { id: "21", text: "Обновление 21", timestamp: 1 },
      { id: "22", text: "Обновление 22", timestamp: 2 },
      { id: "23", text: "Обновление 23", timestamp: 3 },
      { id: "24", text: "Обновление 24", timestamp: 4 },
    ];

    // Возвращаем данные порциями
    return EXAMPLE_DATA;
  } catch (error) {
    console.error("❌ Ошибка при отправке на сервер:", error);
  }
};

export default getListOfUpdates;
