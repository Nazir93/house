"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface LandingFaqProps {
  items: FaqItem[];
  service: string;
}

function FaqRow({ item, index, isOpen, onToggle }: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className="border-b transition-all duration-700"
      style={{
        borderColor: "var(--border)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 sm:py-7 text-left group"
        aria-expanded={isOpen}
      >
        <span className="flex items-start gap-3 sm:gap-6 pr-4 sm:pr-8">
          <span
            className="font-heading text-lg md:text-xl shrink-0 transition-colors duration-300"
            style={{ color: isOpen ? "var(--accent)" : "var(--text-muted)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="text-base md:text-lg transition-colors duration-300"
            style={{ color: "var(--text)" }}
          >
            {item.question}
          </span>
        </span>
        {isOpen ? (
          <Minus size={18} style={{ color: "var(--accent)" }} className="shrink-0" />
        ) : (
          <Plus size={18} style={{ color: "var(--text-muted)" }} className="shrink-0" />
        )}
      </button>
      <div
        className="overflow-hidden transition-[height] duration-500 ease-in-out"
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className="pb-7 pl-0 md:pl-[3.5rem]">
          <p className="text-sm md:text-base leading-relaxed max-w-xl" style={{ color: "var(--text-muted)" }}>
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LandingFaq({ items, service }: LandingFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section
      ref={ref}
      className="py-16 sm:py-24 md:py-32"
      style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)" }}
    >
      <div className="container mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 md:gap-16">
          {/* Left: heading */}
          <div className="md:col-span-4">
            <h2
              className="font-heading text-xl sm:text-2xl md:text-3xl mb-3 break-words transition-all duration-700"
              style={{
                color: "var(--text)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
              }}
            >
              Вопросы
              <br />
              и ответы
            </h2>
            <p
              className="text-sm transition-all duration-700"
              style={{
                color: "var(--text-muted)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: "100ms",
              }}
            >
              Ответы на частые вопросы наших клиентов
            </p>
          </div>

          {/* Right: FAQ list */}
          <div className="md:col-span-8">
            <div className="border-t" style={{ borderColor: "var(--border)" }}>
              {items.map((item, i) => (
                <FaqRow
                  key={i}
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
