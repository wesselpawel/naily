"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaLongArrowAltLeft, FaSave } from "react-icons/fa";
import { addTrainingOffer } from "@/firebase";
import { toast } from "react-toastify";
import { randId } from "@/lib/utils";
import { TrainingOffer } from "@/types";
import { getCities } from "@/utils/getCities";
import { ICity } from "@/types";

export default function NewTrainingOfferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<ICity[]>([]);
  const [input, setInput] = useState<Partial<TrainingOffer>>({
    id: randId(30, "aA0"),
    title: "",
    description: "",
    city: "",
    cityId: "",
    instructor: "",
    price: 0,
    duration: 0,
    maxParticipants: undefined,
    image: "",
    isActive: true,
    isAdminCreated: true,
    contactEmail: "",
    contactPhone: "",
    requirements: [],
    whatYouWillLearn: [],
  });
  const [requirementInput, setRequirementInput] = useState("");
  const [learnInput, setLearnInput] = useState("");

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

  const addLearn = () => {
    if (learnInput.trim()) {
      setInput({
        ...input,
        whatYouWillLearn: [...(input.whatYouWillLearn || []), learnInput.trim()],
      });
      setLearnInput("");
    }
  };

  const removeLearn = (idx: number) => {
    const newLearn = [...(input.whatYouWillLearn || [])];
    newLearn.splice(idx, 1);
    setInput({ ...input, whatYouWillLearn: newLearn });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.title || !input.description || !input.cityId) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    setLoading(true);
    try {
      await addTrainingOffer({
        ...input,
        id: input.id || randId(30, "aA0"),
        createdAt: Date.now(),
      } as TrainingOffer);
      toast.success("Oferta szkolenia została dodana");
      router.push("/admin/szkolenia");
    } catch (error) {
      console.error("Error adding training offer:", error);
      toast.error("Błąd podczas dodawania oferty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <Link
        href="/admin/szkolenia"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <FaLongArrowAltLeft />
        Powrót do listy
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Nowa oferta szkolenia</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white mb-2">Tytuł *</label>
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

          <div>
            <label className="block text-white mb-2">Instruktor</label>
            <input
              type="text"
              value={input.instructor}
              onChange={(e) => setInput({ ...input, instructor: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-white mb-2">Cena (PLN)</label>
            <input
              type="number"
              value={input.price || 0}
              onChange={(e) => setInput({ ...input, price: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              min="0"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Czas trwania (godziny)</label>
            <input
              type="number"
              value={input.duration || 0}
              onChange={(e) => setInput({ ...input, duration: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              min="0"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Max uczestników</label>
            <input
              type="number"
              value={input.maxParticipants || ""}
              onChange={(e) =>
                setInput({
                  ...input,
                  maxParticipants: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">Zdjęcie URL</label>
          <input
            type="url"
            value={input.image || ""}
            onChange={(e) => setInput({ ...input, image: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
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
          <label className="block text-white mb-2">Czego się nauczysz</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={learnInput}
              onChange={(e) => setLearnInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLearn())}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="Dodaj element"
            />
            <button
              type="button"
              onClick={addLearn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Dodaj
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {input.whatYouWillLearn?.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 bg-gray-700 text-white px-3 py-1 rounded-lg"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeLearn(idx)}
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
            href="/admin/szkolenia"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Anuluj
          </Link>
        </div>
      </form>
    </div>
  );
}




















