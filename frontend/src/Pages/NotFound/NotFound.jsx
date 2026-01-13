import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      <h1 className="text-5xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-gray-600">
        Trang bạn tìm không tồn tại hoặc đã bị xóa.
      </p>

      <Link
        to="/"
        className="inline-block mt-8 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        Về trang chủ
      </Link>
    </div>
  );
}