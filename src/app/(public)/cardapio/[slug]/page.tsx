"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Header from "../_components/header";
import Sidebar from "../_components/sideBar";
import Banner from "../_components/banner";
import RestaurantInfo from "../_components/restaurantInfo";
import CategoryTabs from "../_components/categoryTabs";
import ProductSection from "../_components/productSection";

import { API_URL } from "@/services/api";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  is_promotion: boolean;
  is_new: boolean;
  is_active?: boolean;
};

type Category = {
  id: string;
  name: string;
  emoji: string | null;
  sort_order: number;
  is_active?: boolean;
  products: Product[];
};

type BannerType = {
  id: string;
  image_url: string;
  is_active?: boolean;
};

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  address: string | null;
  opening_hours: string | null;
  status: string;
};

type PublicMenu = {
  restaurant: Restaurant;
  banners: BannerType[];
  categories: Category[];
};

export default function CardapioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menu, setMenu] = useState<PublicMenu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/public/menu/${slug}`);

        if (!response.ok) {
          setMenu(null);
          return;
        }

        const data: PublicMenu = await response.json();

        setMenu(data);
      } catch (error) {
        console.error("Erro ao carregar cardápio", error);
        setMenu(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadMenu();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-zinc-600">Carregando cardápio...</p>
      </main>
    );
  }

  if (!menu) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-zinc-600">Cardápio não encontrado.</p>
      </main>
    );
  }

  const activeBanners = menu.banners
    .filter((banner) => banner.is_active !== false)
    .map((banner) => banner.image_url);

  const activeCategories = menu.categories
    .filter((category) => category.is_active !== false)
    .map((category) => ({
      ...category,
      products: category.products.filter(
        (product) => product.is_active !== false,
      ),
    }))
    .filter((category) => category.products.length > 0);

  return (
    <main className="min-h-screen bg-white">
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        restaurant={menu.restaurant}
      />

      <Banner images={activeBanners} />

      <RestaurantInfo restaurant={menu.restaurant} />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <CategoryTabs categories={activeCategories} />

        {activeCategories.map((category) => (
          <ProductSection key={category.id} category={category} />
        ))}
      </section>
    </main>
  );
}