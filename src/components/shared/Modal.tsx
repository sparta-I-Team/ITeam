"use client";
import { useModal } from "@/zustand/modalStore";
import { useEffect } from "react";

export const Modal = () => {
  const { isOpen, closeModal, modalContent } = useModal();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        closeModal();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10000">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-[400px] w-full">
        {modalContent}
        <button
          onClick={closeModal}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg w-full"
        >
          확인
        </button>
      </div>
    </div>
  );
};
