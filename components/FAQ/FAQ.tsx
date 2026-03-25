"use client";
import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FaMinus, FaPlus } from "react-icons/fa6";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FAQProps = {
  title?: string;
  subtitle?: string;
  items: FaqItem[];
  initialOpenId?: string;
  className?: string;
};

export default function FAQ({
  items,
  initialOpenId,
  className,
  title = "Najczęstsze pytania",
  subtitle,
}: FAQProps) {
  const defaultOpenId = useMemo(
    () => initialOpenId || items?.[0]?.id,
    [initialOpenId, items]
  );
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <section
      className={`w-full ${className || ""}`}
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto">
        <div className="mb-10">
          <h2
            id="faq-heading"
            className="text-4xl lg:text-5xl font-baloo font-bold text-neutral-900"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 max-w-3xl text-base text-neutral-600 font-poppins">{subtitle}</p>
          ) : null}
        </div>

        <div className="mx-auto divide-y divide-neutral-200 border-y border-neutral-200 overflow-hidden bg-white">
          {items.map((item, index) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => toggle(item.id)}
                  className={`group w-full flex items-center justify-between gap-4 py-8 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50`}
                >
                  <div className="flex-1">
                    <h3 className="font-inter font-normal text-base md:text-xl text-neutral-700">
                      {item.question}
                    </h3>
                  </div>
                  {isOpen ? (
                    <FaMinus className="h-4 w-4 text-neutral-700" />
                  ) : (
                    <FaPlus className="h-4 w-4 text-neutral-700" />
                  )}
                </button>

                <AnimatePresence initial={false} mode="wait">
                  {isOpen ? (
                    <motion.div
                      id={`faq-panel-${item.id}`}
                      key={`panel-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="font-normal font-inter pb-8 text-neutral-700">
                        <p className="text-sm md:text-base">{item.answer}</p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
