import ProductCard from "./productCard";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
};

type Category = {
  id: string;
  name: string;
  emoji: string | null;
  products: Product[];
};

interface ProductSectionProps {
  category: Category;
}

export default function ProductSection({ category }: ProductSectionProps) {
  return (
    <section id={`categoria-${category.id}`} className="scroll-mt-20 py-8">
      <h2 className="mb-6 text-xl font-bold">
        {category.emoji ? `${category.emoji} ` : ""}
        {category.name}
      </h2>

      {category.products.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhum produto cadastrado nesta categoria.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {category.products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              description={product.description ?? ""}
              price={Number(product.price).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              imageUrl={product.image_url}
            />
          ))}
        </div>
      )}
    </section>
  );
}