/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { fetchJobOffers, deleteJobOffer } from "@/firebase";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

export default function KarieraPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await fetchJobOffers();
        setOffers(data || []);
      } catch (error) {
        console.error("Error fetching job offers:", error);
        toast.error("Błąd podczas ładowania ofert pracy");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleDeleteOffer = async (offerId: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę ofertę pracy?")) {
      try {
        await deleteJobOffer(offerId);
        setOffers(offers.filter((offer) => offer.id !== offerId));
        toast.success("Oferta pracy została usunięta");
      } catch (error) {
        console.error("Error deleting job offer:", error);
        toast.error("Błąd podczas usuwania oferty");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Oferty Pracy</h1>
        <Link
          href="/admin/kariera/new"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaPlus />
          Nowa oferta
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">Brak ofert pracy</div>
          <Link
            href="/admin/kariera/new"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <FaPlus />
            Dodaj pierwszą ofertę
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer: any) => (
            <div
              key={offer.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-xl mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    {offer.salonName} • {offer.city}
                  </p>
                  {offer.salary && (
                    <p className="text-green-400 font-semibold">
                      {offer.salary}
                    </p>
                  )}
                  <p className="text-gray-300 mt-2 line-clamp-2">
                    {offer.description}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/admin/kariera/edit/${offer.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                    title="Edytuj"
                  >
                    <FaEdit size={14} />
                  </Link>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                    title="Usuń"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




















