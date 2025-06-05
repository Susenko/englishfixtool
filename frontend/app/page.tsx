"use client";

import { useEffect, useState } from "react";

type MistakeStat = {
  type: string;
  count: number;
  examples: string[];
  progress: "up" | "down" | "same";
  recommendation: string;
};

type UserStats = {
  level: string;
  topMistakes: MistakeStat[];
};

const categoryMap: Record<string, { ua: string; recommendation: string }> = {
  Articles: {
    ua: "Артиклі",
    recommendation: "Повторити правила вживання a/an/the",
  },
  WordOrder: {
    ua: "Порядок слів (Word Order)",
    recommendation: "Переглянути структуру речень",
  },
  VerbTenses: {
    ua: "Часи дієслів  (Verb Tenses)",
    recommendation: "Вивчити часи Present, Past, Future",
  },
  SubjectVerbAgreement: {
    ua: "Узгодження підмета й присудка",
    recommendation: "Приклад: She don’t like замість She doesn’t like.",
  },
  Prepositions: {
    ua: "Прийменники",
    recommendation: "on environment замість in environment",
  },
  WordChoice: {
    ua: "Словниковий запас",
    recommendation: "Збільшити словниковий запас і уникати кальок",
  },
  QuestionFormation: {
    ua: "Формування запитань",
    recommendation: "Повторити структуру запитань у Present/Past",
  },
  BusinessTone: {
    ua: "Формальний стиль",
    recommendation: "Використовувати офіційний тон у діловому листуванні",
  },
  SentenceFlow: {
    ua: "Плавність речення",
    recommendation: "Зробити речення логічнішими й зв’язнішими",
  },
  Spelling: {
    ua: "Орфографія",
    recommendation: "Перевіряти написання слів",
  },
};

export default function HomePage() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/statistics");
        const data = await res.json();

        const statsArray: MistakeStat[] = Object.entries(data).map(
          ([key, count]) => ({
            type: categoryMap[key]?.ua || key,
            count: typeof count === "number" ? count : 0,
            examples: [], // можна додати пізніше
            progress: "same",
            recommendation: categoryMap[key]?.recommendation || "",
          })
        );

        setStats({
          level: "B1", // Поки статично
          topMistakes: statsArray.sort((a, b) => b.count - a.count),
        });
      } catch (err) {
        console.error("❌ Не вдалося завантажити статистику:", err);
      }
    };

    loadStats();
  }, []);

  const getProgressSymbol = (progress: string) => {
    switch (progress) {
      case "up":
        return "⬆";
      case "down":
        return "⬇";
      default:
        return "🟰";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">
        Рівень англійської:{" "}
        <span className="text-blue-600">{stats?.level || "..."}</span>
      </h1>

      <h2 className="text-2xl font-semibold mb-4">
        Статистика типових помилок
      </h2>

      <table className="w-full text-left border border-gray-300 rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Тип помилки</th>
            <th className="p-2 border">Кількість</th>
            <th className="p-2 border">Приклади</th>
            <th className="p-2 border">Прогрес</th>
            <th className="p-2 border">Рекомендації</th>
          </tr>
        </thead>
        <tbody>
          {stats?.topMistakes.map((mistake, index) => (
            <tr key={index} className="border-t">
              <td className="p-2 border font-medium">{mistake.type}</td>
              <td className="p-2 border">{mistake.count}</td>
              <td className="p-2 border text-gray-600 italic text-sm">
                {mistake.examples.length ? (
                  <ul className="list-disc list-inside">
                    {mistake.examples.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-2 border text-center text-lg">
                {getProgressSymbol(mistake.progress)}
              </td>
              <td className="p-2 border text-sm">{mistake.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
