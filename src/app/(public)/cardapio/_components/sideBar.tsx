type Restaurant = {
  name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export default function Sidebar({
  isOpen,
  onClose,
  restaurant,
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      <aside className="relative h-full w-80 bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-zinc-600"
        >
          ×
        </button>

        <div className="mt-10 flex flex-col items-center">
          {restaurant.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="h-14 w-14 rounded-md object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-md bg-zinc-900" />
          )}

          <h2 className="mt-4 text-center font-bold">
            {restaurant.name}
          </h2>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold">
            Contatos
          </h3>

          {restaurant.address && (
            <p className="mt-4 text-sm text-zinc-600">
              {restaurant.address}
            </p>
          )}

          {restaurant.phone && (
            <p className="mt-3 text-sm text-zinc-600">
              {restaurant.phone}
            </p>
          )}

          {restaurant.whatsapp && (
            <p className="mt-3 text-sm text-zinc-600">
              WhatsApp: {restaurant.whatsapp}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}