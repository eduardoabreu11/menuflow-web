"use client";

import Image from "next/image";
import { useState } from "react";

interface BannerProps {
  images: string[];
}

export default function Banner({ images }: BannerProps) {
  const [currentImage, setCurrentImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <section className="mx-auto max-w-6xl">
        <div className="h-[400px] rounded-md bg-zinc-300" />
      </section>
    );
  }

  function nextImage() {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function previousImage() {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="relative h-[400px] overflow-hidden rounded-md bg-zinc-300">
        <Image
          src={images[currentImage]}
          alt="Banner do restaurante"
          fill
          className="object-cover"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white"
            >
              ‹
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white"
            >
              ›
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`h-2.5 w-2.5 rounded-full ${
                currentImage === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
