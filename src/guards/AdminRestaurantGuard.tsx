"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  clearSelectedRestaurant,
  getMyRestaurants,
  getSelectedRestaurant,
  saveSelectedRestaurant,
} from "@/services/restaurantService";

type AdminRestaurantGuardProps = {
  children: ReactNode;
};

const routesWithoutSelectedRestaurant = [
  "/admin/restaurantes/selecionar",
  "/admin/restaurantes/novo",
];

export default function AdminRestaurantGuard({
  children,
}: AdminRestaurantGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingRestaurant, setCheckingRestaurant] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSelectedRestaurant() {
      try {
        if (routesWithoutSelectedRestaurant.includes(pathname)) {
          if (isMounted) {
            setCheckingRestaurant(false);
          }

          return;
        }

        const restaurants = await getMyRestaurants();

        if (restaurants.length === 0) {
          clearSelectedRestaurant();
          router.replace("/admin/restaurantes/novo");
          return;
        }

        const selectedRestaurant = getSelectedRestaurant();

        if (selectedRestaurant) {
          const updatedSelectedRestaurant = restaurants.find(
            (restaurant) => restaurant.id === selectedRestaurant.id,
          );

          if (updatedSelectedRestaurant) {
            saveSelectedRestaurant(updatedSelectedRestaurant);

            if (isMounted) {
              setCheckingRestaurant(false);
            }

            return;
          }
        }

        if (restaurants.length === 1) {
          saveSelectedRestaurant(restaurants[0]);

          if (isMounted) {
            setCheckingRestaurant(false);
          }

          return;
        }

        clearSelectedRestaurant();
        router.replace("/admin/restaurantes/selecionar");
      } catch (error) {
        console.error(error);
        clearSelectedRestaurant();
        router.replace("/admin/restaurantes/selecionar");
      }
    }

    checkSelectedRestaurant();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (checkingRestaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Carregando restaurante...
        </p>
      </main>
    );
  }

  return children;
}