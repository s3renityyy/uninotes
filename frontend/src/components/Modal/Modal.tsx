import "./Modal.scss";
import { ReactNode } from "react";

interface ModalComponentProps {
  closeModal: () => void;
  children?: ReactNode;
  isOpen: boolean;
}

const Modal = ({ children, closeModal, isOpen }: ModalComponentProps) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return isOpen ? (
    <dialog className="overlay" onClick={(e) => handleOverlayClick(e)}>
      <div className="modal">{children}</div>
    </dialog>
  ) : (
    <></>
  );
};

export default Modal;
