"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ModalContextType {
  isOpen: boolean;
  openModal: () => void;
  openModalToEstimate: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  openModal: () => {},
  openModalToEstimate: () => {},
  closeModal: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  /** Совместимость с баннером «Рассчитать стоимость» — то же окно, что и openModal. */
  const openModalToEstimate = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isOpen,
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
