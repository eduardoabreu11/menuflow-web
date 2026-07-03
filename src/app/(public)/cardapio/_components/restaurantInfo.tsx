type Restaurant = {
  name: string;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  address: string | null;
  opening_hours: string | null;
};

interface RestaurantInfoProps {
  restaurant: Restaurant;
}

export default function RestaurantInfo({ restaurant }: RestaurantInfoProps) {
  return (
    <section className="mx-auto flex max-w-6xl items-center justify-between border-b px-4 py-4">
      <div className="flex items-center gap-4">
        {restaurant.logo_url ? (
          <img
            src={restaurant.logo_url}
            alt={restaurant.name}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-zinc-900" />
        )}

        <div>
          <h1 className="text-lg font-medium">{restaurant.name}</h1>

          {restaurant.description && (
            <p className="text-sm text-slate-500">{restaurant.description}</p>
          )}
        </div>
      </div>

      <button
        onClick={async () => {
          const url = window.location.href;

          if (navigator.share) {
            await navigator.share({
              title: restaurant.name,
              text: restaurant.description ?? "",
              url,
            });

            return;
          }

          await navigator.clipboard.writeText(url);

          alert("Link copiado!");
        }}
        className="text-2xl text-slate-500"
      >
        ⤴
      </button>
    </section>
  );
}
