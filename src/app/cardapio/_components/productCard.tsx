interface ProductCardProps {
  name: string;
  description: string;
  price: string;
  imageUrl?: string | null;
}

export default function ProductCard({
  name,
  description,
  price,
  imageUrl,
}: ProductCardProps) {
  return (
    <article className="flex gap-4">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-24 w-24 rounded-md object-cover"
        />
      ) : (
        <div className="h-24 w-24 rounded-md bg-zinc-300" />
      )}

      <div>
        <h3 className="font-semibold">{name}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>
        <strong className="mt-3 block text-sm">
          {price}
        </strong>
      </div>
    </article>
  );
}