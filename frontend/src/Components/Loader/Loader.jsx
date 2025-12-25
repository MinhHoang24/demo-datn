export default function Loader({ size = 40, className = "" }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
}