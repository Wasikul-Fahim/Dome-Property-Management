export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-full max-w-sm">
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="text-sm px-3 py-1.5 rounded-lg text-gray-600 hover:bg-brand-80"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="text-sm px-3 py-1.5 rounded-lg bg-white text-red-600 border-red-600 hover:bg-red-600 hover:text-white hover:border hover:border-red-600"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}