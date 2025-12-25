import Item from "../Item/Item";

export default function RelatedProducts({ products }) {
  if (!products?.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">SẢN PHẨM TƯƠNG TỰ</h2>
      <div className="flex gap-4 overflow-x-auto">
        {products.map((p) => (
          <Item
            key={p._id}
            id={p._id}
            name={p.name}
            image={p.variants[0]?.image}
            sale={p.variants[0]?.sale}
            price={p.price}
            rating={p.rating}
          />
        ))}
      </div>
    </div>
  );
}