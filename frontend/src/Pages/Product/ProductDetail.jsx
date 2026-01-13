import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../Api/Api";

import Breadcrumbs from "../../Components/BreadCrumbs/BreadCrumbs";

import {
  ProductGallery,
  ProductInfo,
  ProductTabs,
  ProductReviews,
  RelatedProducts,
} from "../../Components/product-detail";

import LoginPopup from "../../Components/LoginPopUp/LoginPopUp";
import Loader from "../../Components/Loader/Loader";

export default function ProductDetail() {
  const { productId } = useParams();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await apiService.getProductById(productId);
        console.log(res);
        if (mounted) {
          setProduct(res.data.product);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Có lỗi xảy ra");
          setLoading(false);
        }
      }
    };

    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!product?._id) return;

    const fetchRelated = async () => {
      try {
        setLoadingRelated(true);
        const res = await apiService.getRelatedProducts(product._id);
        setRelatedProducts(res.data || []);
      } catch (err) {
        console.error("Fetch related products failed", err);
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [product?._id]);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        <Loader size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-600">
        Lỗi: {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        Sản phẩm không tồn tại
      </div>
    );
  }

  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {/* BREADCRUMB */}
        <Breadcrumbs product={product} category={product.category} />

        {/* PRODUCT MAIN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow">
          <ProductGallery
            variants={product.variants}
            selectedIndex={selectedVariantIndex}
            onChangeIndex={setSelectedVariantIndex}
          />

          <ProductInfo
            product={product}
            selectedVariantIndex={selectedVariantIndex}
            onChangeVariant={setSelectedVariantIndex}
          />
        </div>

        {/* DESCRIPTION / SPECS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <ProductTabs
            description={product.description}
            specifications={product.specifications}
          />
        </div>

        {/* REVIEWS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <ProductReviews
            product={product}
            onOpenLogin={openPopup}
          />
        </div>

        {/* RELATED PRODUCTS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <RelatedProducts products={relatedProducts} loading={loadingRelated} />
        </div>
      </div>

      {/* LOGIN POPUP */}
      {isPopupOpen && (
        <LoginPopup onClose={closePopup} />
      )}
    </div>
  );
}