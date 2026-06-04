"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type EstimateModalPayload = {
  source: string;
  service?: string;
  calcData?: unknown;
};

interface ModalContextType {
  isOpen: boolean;
  estimatePayload: EstimateModalPayload | null;
  openModal: () => void;
  openModalToEstimate: (payload?: EstimateModalPayload) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  estimatePayload: null,
  openModal: () => {},
  openModalToEstimate: () => {},
  closeModal: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [estimatePayload, setEstimatePayload] = useState<EstimateModalPayload | null>(null);

  const openModal = useCallback(() => {
    setEstimatePayload(null);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  /** Совместимость с баннером «Рассчитать стоимость» — то же окно, что и openModal. */
  const openModalToEstimate = useCallback((payload?: EstimateModalPayload) => {
    setEstimatePayload(payload ?? null);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEstimatePayload(null);
    document.body.style.overflow = "";
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        estimatePayload,
        openModal,
        openModalToEstimate,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
