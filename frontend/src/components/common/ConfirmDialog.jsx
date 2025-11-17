// components/common/ConfirmDialog.jsx
import React from 'react';
import './ConfirmDialog.css';
import { FaExclamationTriangle, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

const ConfirmDialog = ({ 
  isOpen, 
  title = '¿Confirmar acción?', 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning' // warning, danger, info
}) => {
  if (!isOpen) return null;

  const icons = {
    warning: <FaExclamationTriangle />,
    danger: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
    question: <FaQuestionCircle />
  };

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className={`confirm-dialog confirm-dialog-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-icon">
          {icons[type]}
        </div>
        <div className="confirm-dialog-content">
          <h3 className="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-message">{message}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button className="btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn-confirm btn-confirm-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
