"use client";
import { FaCalendarAlt } from "react-icons/fa";
import { User, IService } from "@/types";
import { cn } from "@/lib/utils";

interface ReservationButtonProps {
  user: User;
  preselectedService?: IService | null;
  onModalOpen?: () => void;
  /** e.g. landing-style pill on public profile hero */
  className?: string;
}

export default function ReservationButton({
  user: _user,
  preselectedService = null,
  onModalOpen,
  className,
}: ReservationButtonProps) {
  const handleOpen = () => {
    // If onModalOpen callback is provided, use it (parent handles modal)
    // Otherwise, this button is used standalone and needs its own modal logic
    if (onModalOpen) {
      onModalOpen();
    } else {
      // Fallback: if no callback, we'd need to handle modal here
      // But for now, we'll just trigger the callback if available
      console.warn("ReservationButton: onModalOpen callback not provided");
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={cn(
        "group relative w-full flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-poppins font-semibold text-sm md:text-base transition-all duration-200 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] shadow-md hover:shadow-lg",
        className
      )}
    >
      <FaCalendarAlt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
      <span>Zarezerwuj wizytę</span>
    </button>
  );
}
