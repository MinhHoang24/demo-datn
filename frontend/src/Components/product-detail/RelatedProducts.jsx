import Item from "../Item/Item";
import Loader from "../Loader/Loader";

export default function RelatedProducts({ products, loading }) {
  if (loading) {
    return <Loader />;
  }

  if (!products?.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">SẢN PHẨM TƯƠNG TỰ</h2>
      <div className="flex gap-4 overflow-x-auto">
        {products.map((p) => (
          <div
            key={p._id}
            className="flex-shrink-0 w-[220px]"
          >
            <Item
              id={p._id}
              name={p.name}
              image={p.variants[0]?.image}
              sale={p.variants[0]?.sale}
              price={p.price}
              rating={p.rating}
            />
          </div>
        ))}
      </div>
    </div>
  );
}