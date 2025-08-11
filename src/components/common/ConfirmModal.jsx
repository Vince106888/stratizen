// src/components/common/ConfirmModal.jsx
import React from "react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onCancel} // click outside closes modal
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
