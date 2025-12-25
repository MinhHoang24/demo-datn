export default function NoData({ message = "Không có sản phẩm nào" }) {
  return (
    <div className="w-full h-[300px] flex flex-col items-center justify-center text-center text-gray-500 text-base">
      <p className="text-4xl mb-2">📦</p>
      <span>{message}</span>
    </div>
  );
}