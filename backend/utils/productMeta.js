const withVariantMeta = (product) => {
  if (!product) return product;

  const variants = product.variants || [];

  const quantity = variants.reduce(
    (sum, v) => sum + (v.quantity || 0),
    0
  );

  const sale = variants.reduce(
    (max, v) => Math.max(max, v.sale || 0),
    0
  );

  return {
    ...product.toObject(),
    quantity,
    sale,
  };
};

module.exports = { withVariantMeta };