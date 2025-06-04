"use client";

import { useState } from "react";

type Phrase = { en: string; uk: string };

export default function SlovnykPage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Phrase[] | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/thoughts-dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();

      let phrases: Phrase[] = [];

      if (typeof data.phrases === "string") {
        phrases = JSON.parse(data.phrases); // Якщо це рядок — розпарсимо
      } else {
        phrases = data.phrases; // Інакше — вже масив
      }

      setResult(phrases);
    } catch (error) {
      console.error("❌ Error parsing phrases:", error);
      setResult([]);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧠 Словник думок</h1>
      <textarea
        className="w-full h-40 p-2 border border-gray-300 rounded"
        placeholder="Введіть текст про вашу роботу..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Обробка..." : "Аналізувати"}
      </button>

      {result && result.length > 0 && (
        <ul className="mt-6 list-disc list-inside space-y-2">
          {result.map((item, index) => (
            <li key={index}>
              <strong>🇬🇧 {item.en}</strong> — 🇺🇦 {item.uk}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
