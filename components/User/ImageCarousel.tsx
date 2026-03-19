"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ImageCarouselProps {
  images: Array<{ id?: string; url?: string; title?: string }>;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function ImageCarousel({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!isOpen && !isClosing) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-200 ${
        isOpen && !isClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 text-white hover:scale-110"
        aria-label="Zamknij"
      >
        <FaTimes className="w-6 h-6" />
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 text-white hover:scale-110"
            aria-label="Poprzednie zdjęcie"
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 text-white hover:scale-110"
            aria-label="Następne zdjęcie"
          >
            <FaChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main image */}
      <div
        className="relative max-w-[95vw] max-h-[90vh] w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-full max-w-5xl h-full max-h-[80vh] flex items-center justify-center">
            {currentImage?.url && (
              <Image
                src={currentImage.url}
                alt={currentImage.title || `Zdjęcie ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 95vw, (max-width: 1200px) 90vw, 1200px"
                priority
              />
            )}
          </div>

          {/* Image title */}
          {currentImage?.title && (
            <div className="mt-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg max-w-2xl">
              <p className="text-white text-center font-poppins text-base sm:text-lg">
                {currentImage.title}
              </p>
            </div>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="mt-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <p className="text-white text-sm font-poppins">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail strip (desktop only) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                idx === currentIndex
                  ? "border-white scale-110"
                  : "border-white/30 hover:border-white/60"
              }`}
              aria-label={`Pokaż zdjęcie ${idx + 1}`}
            >
              {img.url && (
                <Image
                  src={img.url}
                  alt={img.title || `Miniatura ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}











