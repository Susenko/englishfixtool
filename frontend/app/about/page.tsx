export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Про проєкт</h1>
      <p className="mb-2">
        Цей додаток створено для перевірки англійських речень на граматичні та лексичні помилки. 
        Ви можете ввести фразу англійською мовою, і система надасть зворотний зв’язок на основі аналізу штучного інтелекту.
      </p>
      <p className="mb-2">
        У роботі використано OpenAI API, Next.js (App Router), FastAPI та Docker. 
        Все працює як один цілісний застосунок, який можна швидко розгорнути та протестувати.
      </p>
      <p className="text-sm text-gray-500">
        Автор: Андрій Сусенко, червень 2025 року.
      </p>
    </div>
  );
}
