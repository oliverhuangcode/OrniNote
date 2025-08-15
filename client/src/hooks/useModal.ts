import { useState } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

export const useModal = (): UseModalReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openModal = (): void => setIsOpen(true);
  const closeModal = (): void => setIsOpen(false);
  const toggleModal = (): void => setIsOpen(!isOpen);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};