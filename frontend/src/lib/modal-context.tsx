"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/** Сразу открыть ContactModal на форме «Ориентировочный расчёт». */
export type ContactModalInitialStep = "form-calculator" | null;

interface ModalContextType {
  isOpen: boolean;
  openModal: () => void;
  openModalToEstimate: () => void;
  closeModal: () => void;
  initialContactStep: ContactModalInitialStep;
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  openModal: () => {},
  openModalToEstimate: () => {},
  closeModal: () => {},
  initialContactStep: null,
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialContactStep, setInitialContactStep] = useState<ContactModalInitialStep>(null);

  const openModal = useCallback(() => {
    setInitialContactStep(null);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const openModalToEstimate = useCallback(() => {
    setInitialContactStep("form-calculator");
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setInitialContactStep(null);
    document.body.style.overflow = "";
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        openModal,
        openModalToEstimate,
        closeModal,
        initialContactStep,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
