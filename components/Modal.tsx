import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-3xl font-bold font-serif text-gray-800">{title}</h2>
        </div>
        <div>
          {children}
        </div>
         <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Close modal"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
      </div>
    </div>
  );
};

export default Modal;