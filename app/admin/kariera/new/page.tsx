"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaLongArrowAltLeft, FaSave } from "react-icons/fa";
import { addJobOffer } from "@/firebase";
import { toast } from "react-toastify";
import { randId } from "@/lib/utils";
import { JobOffer } from "@/types";
import { getCities } from "@/utils/getCities";
import { ICity } from "@/types";

export default function NewJobOfferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<ICity[]>([]);
  const [input, setInput] = useState<Partial<JobOffer>>({
    id: randId(30, "aA0"),
    title: "",
    description: "",
    city: "",
    cityId: "",
    salonName: "",
    salonId: "",
    salary: "",
    employmentType: undefined,
    requirements: [],
    benefits: [],
    isActive: true,
    isAdminCreated: true,
    contactEmail: "",
    contactPhone: "",
    location: "",
  });
  const [requirementInput, setRequirementInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  useEffect(() => {
    const loadCities = async () => {
      const allCities = await getCities();
      const citiesOnly = allCities.filter((c) => c.type === "city");
      setCities(citiesOnly);
    };
    loadCities();
  }, []);

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setInput({
        ...input,
        requirements: [...(input.requirements || []), requirementInput.trim()],
      });
      setRequirementInput("");
    }
  };

  const removeRequirement = (idx: number) => {
    const newRequirements = [...(input.requirements || [])];
    newRequirements.splice(idx, 1);
    setInput({ ...input, requirements: newRequirements });
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setInput({
        ...input,
        benefits: [...(input.benefits || []), benefitInput.trim()],
      });
      setBenefitInput("");
    }
  };

  const removeBenefit = (idx: number) => {
    const newBenefits = [...(input.benefits || [])];
    newBenefits.splice(idx, 1);
    setInput({ ...input, benefits: newBenefits });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.title || !input.description || !input.cityId || !input.salonName) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    setLoading(true);
    try {
      await addJobOffer({
        ...input,
        id: input.id || randId(30, "aA0"),
        createdAt: Date.now(),
      } as JobOffer);
      toast.success("Oferta pracy została dodana");
      router.push("/admin/kariera");
    } catch (error) {
      console.error("Error adding job offer:", error);
      toast.error("Błąd podczas dodawania oferty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <Link
        href="/admin/kariera"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <FaLongArrowAltLeft />
        Powrót do listy
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Nowa oferta pracy</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white mb-2">Tytuł stanowiska *</label>
          <input
            type="text"
            value={input.title}
            onChange={(e) => setInput({ ...input, title: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-white mb-2">Opis *</label>
          <textarea
            value={input.description}
            onChange={(e) => setInput({ ...input, description: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg h-32"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white mb-2">Nazwa salonu *</label>
            <input
              type="text"
              value={input.salonName}
              onChange={(e) => setInput({ ...input, salonName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Miasto *</label>
            <select
              value={input.cityId}
              onChange={(e) => {
                const city = cities.find((c) => c.id === e.target.value);
                setInput({
                  ...input,
                  cityId: e.target.value,
                  city: city?.name || "",
                });
              }}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              required
            >
              <option value="">Wybierz miasto</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white mb-2">Wynagrodzenie</label>
            <input
              type="text"
              value={input.salary || ""}
              onChange={(e) => setInput({ ...input, salary: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="np. 3000-5000 PLN"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Typ zatrudnienia</label>
            <select
              value={input.employmentType || ""}
              onChange={(e) =>
                setInput({
                  ...input,
                  employmentType: e.target.value as JobOffer["employmentType"],
                })
              }
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
            >
              <option value="">Wybierz typ</option>
              <option value="full-time">Pełny etat</option>
              <option value="part-time">Część etatu</option>
              <option value="contract">Umowa zlecenie</option>
              <option value="internship">Staż</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">Lokalizacja</label>
          <input
            type="text"
            value={input.location || ""}
            onChange={(e) => setInput({ ...input, location: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
            placeholder="np. ul. Główna 1"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Email kontaktowy</label>
          <input
            type="email"
            value={input.contactEmail || ""}
            onChange={(e) => setInput({ ...input, contactEmail: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Telefon kontaktowy</label>
          <input
            type="tel"
            value={input.contactPhone || ""}
            onChange={(e) => setInput({ ...input, contactPhone: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Wymagania</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="Dodaj wymaganie"
            />
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Dodaj
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {input.requirements?.map((req, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 bg-gray-700 text-white px-3 py-1 rounded-lg"
              >
                {req}
                <button
                  type="button"
                  onClick={() => removeRequirement(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">Benefity</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={benefitInput}
              onChange={(e) => setBenefitInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="Dodaj benefit"
            />
            <button
              type="button"
              onClick={addBenefit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Dodaj
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {input.benefits?.map((benefit, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 bg-gray-700 text-white px-3 py-1 rounded-lg"
              >
                {benefit}
                <button
                  type="button"
                  onClick={() => removeBenefit(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Zapisywanie..." : "Zapisz"}
          </button>
          <Link
            href="/admin/kariera"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Anuluj
          </Link>
        </div>
      </form>
    </div>
  );
}




















