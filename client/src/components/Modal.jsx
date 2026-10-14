import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      // Focus the modal content
      if (modalRef.current) {
        modalRef.current.focus();
      }

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Center container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full ${
            sizeStyles[size] || sizeStyles.md
          } border border-slate-200 outline-none`}
        >
          {/* Header */}
          {(title || onClose) && (
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                {title && (
                  <h3 id="modal-title" className="text-lg font-semibold text-slate-900">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                )}
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors motion-reduce:transition-none"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
