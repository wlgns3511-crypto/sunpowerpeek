"use client";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-8 border-t pt-8" data-upgrade="faq">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <details
            key={i}
            className="group border border-slate-200 rounded-lg bg-white p-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between font-semibold text-slate-800 cursor-pointer focus:outline-none">
              <span>{item.question}</span>
              <span className="transition group-open:rotate-180">
                <svg
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  className="h-5 w-5 text-slate-500"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
