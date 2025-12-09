"use client";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FaqHandlerProps, FaqItem } from "@/types";
import { toast } from "react-toastify";

export default function FaqHandler({ input, setInput }: FaqHandlerProps) {
  const [faqInput, setFaqInput] = useState<FaqItem>({
    question: "",
    answer: "",
  });
  function removeFaq(index: number) {
    const newFaqList = [...input.faq];
    newFaqList.splice(index, 1);
    setInput({ ...input, faq: newFaqList });
  }
  async function generateFaq() {
    try {
      if (!input.title && !input.intro) {
        toast.error("Podaj tytuł lub wstęp, aby wygenerować FAQ");
        return;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/blog/generate-faq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          intro: input.intro,
          sections: input.sections,
        }),
      });
      if (!res.ok) throw new Error("FAQ generation failed");
      const data = await res.json();
      const items: FaqItem[] = Array.isArray(data.faq) ? data.faq : [];
      if (!items.length) {
        toast.info("Brak nowych pytań");
        return;
      }
      setInput({ ...input, faq: [...input.faq, ...items] });
      toast.success("Dodano wygenerowane pytania");
    } catch (e) {
      console.error(e);
      toast.error("Nie udało się wygenerować FAQ");
    }
  }
  return (
    <div className="flex flex-col text-white">
      {" "}
      <p className="text-2xl mb-3">Pytania i odpowiedzi</p>
      <div className="flex gap-3 mb-3">
        <button
          onClick={generateFaq}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
        >
          Wygeneruj FAQ
        </button>
      </div>
      <label htmlFor="question">Pytanie</label>
      <input
        name="question"
        placeholder="Wpisz tekst..."
        value={faqInput.question}
        onChange={(e) => setFaqInput({ ...faqInput, question: e.target.value })}
        className="!text-black  bg-slate-400 mt-1 p-2 outline-none placeholder:text-gray-500"
        type="text"
      />
      <label htmlFor="answer">Odpowiedź</label>
      <input
        name="answer"
        placeholder="Wpisz tekst..."
        value={faqInput.answer}
        onChange={(e) => setFaqInput({ ...faqInput, answer: e.target.value })}
        className="!text-black  bg-slate-400 mt-1 p-2 outline-none placeholder:text-gray-500"
        type="text"
      />
      <button
        onClick={() => {
          setInput({ ...input, faq: [...input.faq, faqInput] });
          setFaqInput({ question: "", answer: "" });
        }}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-md text-white mt-2"
      >
        Dodaj
      </button>
      {input.faq.length !== 0 && <h1 className="my-2">Twoje faq</h1>}
      <div className="flex flex-col  w-full">
        {input.faq.map((faq: FaqItem, i: number) => (
          <div key={i} className="flex flex-row items-center">
            {faq.question}
            <button
              onClick={() => {
                removeFaq(i);
              }}
              className="ml-3 mr-4"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
