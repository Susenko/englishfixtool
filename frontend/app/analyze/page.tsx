"use client";

import { useState, useEffect } from "react";

type PhraseRow = {
  original: string;
  fixed: string;
  issue: string;
};

export default function AnalyzePage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PhraseRow[]>([]);

  const fetchPhrases = async () => {
    const res = await fetch("http://localhost:8000/phrases-file-json");
    const json = await res.json();
    setRows(json);
  };

  useEffect(() => {
    fetchPhrases(); // load on page open
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    const res = await fetch("http://localhost:8000/analyze-and-append", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText }),
    });

    const data = await res.json();

    if (data.entry) {
      setRows((prev) => [data.entry, ...prev]); // додаємо нову фразу
    }

    setLoading(false);
    setInputText(""); // очищаємо textarea
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">✍️ Аналіз англійських фраз</h1>
      <textarea
        className="w-full p-2 h-32 border rounded mb-4"
        placeholder="Введіть англійську фразу..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Обробка..." : "Відправити"}
      </button>

      <h1 className="text-2xl font-bold mt-10 mb-6">
        🧠 Фрази із виправленням
      </h1>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Оригінал</th>
            <th className="border px-4 py-2 text-left">Виправлено</th>
            <th className="border px-4 py-2 text-left">Проблема</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50">
              <td className="border px-4 py-2">{row.original}</td>
              <td className="border px-4 py-2 text-green-700 font-medium">
                {row.fixed}
              </td>
              <td className="border px-4 py-2 text-red-600">{row.issue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
