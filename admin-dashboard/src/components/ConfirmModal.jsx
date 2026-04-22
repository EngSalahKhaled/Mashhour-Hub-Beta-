import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // "danger" or "primary"
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
      <div className="flex flex-col items-center text-center">
        <div 
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-500'
          }`}
        >
          <AlertCircle size={32} />
        </div>
        
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <button onClick={onClose} className="btn-ghost flex-1">
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`flex-1 ${type === 'danger' ? 'btn-danger !py-2.5 !text-sm !font-semibold' : 'btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
