"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  emoji: string | null;
};

type CategoryTabsProps = {
  categories: Category[];
};

export default function CategoryTabs({ categories }: CategoryTabsProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? "",
  );

  return (
    <div className="sticky top-0 z-30 bg-white">
      <div className="flex gap-8 overflow-x-auto border-b border-zinc-200 px-1">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;

          return (
            <a
              key={category.id}
              href={`#categoria-${category.id}`}
              onClick={() => setActiveCategoryId(category.id)}
              className={
                isActive
                  ? "shrink-0 border-b-2 border-red-600 py-4 text-sm font-bold text-zinc-900"
                  : "shrink-0 border-b-2 border-transparent py-4 text-sm font-semibold text-zinc-500 hover:text-zinc-900"
              }
            >
              {category.emoji || "📂"} {category.name}
            </a>
          );
        })}
      </div>
    </div>
  );
}