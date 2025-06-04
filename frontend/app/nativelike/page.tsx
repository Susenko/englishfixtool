"use client";
import { useState } from "react";

export default function NativeLikePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<null | {
    is_correct: boolean;
    native_perception: string;
  }>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/nativelike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      let parsed = data.native_perception;

      try {
        const json = JSON.parse(data.native_perception);
        parsed = json.native_perception;
        data.is_correct = json.is_correct;
      } catch {}

      setResult({
        is_correct: data.is_correct,
        native_perception: parsed,
      });
    } catch (error) {
      console.error("❌ Сталася помилка при запиті:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🧪 Як нейтів</h1>

      <textarea
        className="w-full border p-3 rounded resize-none"
        rows={4}
        placeholder="Введи англійське речення"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Аналізувати
      </button>
      {loading && (
        <div className="flex items-center space-x-2 text-gray-600">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span>Аналізуємо...</span>
        </div>
      )}
      {result && (
        <div className="bg-gray-100 p-4 rounded space-y-2">
          <p>
            <strong>Граматично / лексично:</strong>{" "}
            {result.is_correct ? "Правильно ✅" : "Неправильно ❌"}
          </p>
          <p>
            <strong>🧠 Як це сприймає нейтів:</strong>{" "}
            {result.native_perception}
          </p>
        </div>
      )}
    </div>
  );
}
