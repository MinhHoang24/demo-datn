import { useEffect } from "react";

export default function Toast({
  message,
  onClose,
  duration = 3000,
  type = "success",
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "error" ? "bg-red-600" : "bg-green-600";

  return (
    <div
      className={`
        fixed top-24 right-6 z-[9999]
        ${bgColor} text-white
        px-6 py-3 rounded-lg shadow-lg
        animate-fade-in
      `}
    >
      {message}
    </div>
  );
}
