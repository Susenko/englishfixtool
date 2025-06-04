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

export default function HomePage() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const mockStats: UserStats = {
      level: "B1",
      topMistakes: [
        {
          type: "Артиклі",
          count: 6,
          examples: ["I want apple", "He is engineer"],
          progress: "down",
          recommendation: "Повторити правила вживання a/an/the",
        },
        {
          type: "Граматика",
          count: 10,
          examples: ["She don’t like pizza", "I goed to school"],
          progress: "same",
          recommendation: "Переглянути Present Simple та неправильні дієслова",
        },
        {
          type: "Стиль",
          count: 3,
          examples: ["Please, learn comments", "I spended some time..."],
          progress: "up",
          recommendation: "Звернути увагу на формулювання як у native-спікерів",
        },
      ],
    };

    setStats(mockStats);
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
        Рівень англійської: <span className="text-blue-600">{stats?.level || "..."}</span>
      </h1>

      <h2 className="text-2xl font-semibold mb-4">Статистика типових помилок</h2>

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
              <td className="p-2 border">
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {mistake.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </td>
              <td className="p-2 border text-center text-lg">
                {getProgressSymbol(mistake.progress)}
              </td>
              <td className="p-2 border text-sm text-gray-800">
                {mistake.recommendation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
