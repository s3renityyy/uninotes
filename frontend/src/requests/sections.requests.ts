interface ChildSection {
  key: string;
  label: string;
}

interface Section {
  key: string;
  label: string;
  children?: ChildSection[];
}

const getSections = async () => {
  try {
    const EXAMPLE_SECTIONS = [
      {
        key: "tryhackme",
        label: "TryHackMe",
      },
      {
        key: "algorithms",
        label: "Алгоритмы",
        children: [
          {
            key: "lab",
            label: "Лабораторные работы",
          },
          {
            key: "notes",
            label: "Конспекты",
          },
        ],
      },
      {
        key: "edpm",
        label: "Архитектура ЭВМ",
        children: [
          {
            key: "lab",
            label: "Лабораторные работы",
          },
          {
            key: "notes",
            label: "Конспекты",
          },
        ],
      },
    ];
    return EXAMPLE_SECTIONS;
  } catch (error) {
    console.error("❌ Ошибка при отправке на сервер:", error);
    return [];
  }
};

export default getSections;
