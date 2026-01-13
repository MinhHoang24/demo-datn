export default function ConfirmModal({
  open,
  title = "Xác nhận",
  message = "Bạn có chắc không?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}