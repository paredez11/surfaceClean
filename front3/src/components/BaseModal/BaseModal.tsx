// components/BaseModal/BaseModal.tsx
import React from "react";
import "./BaseModal.css";

interface BaseModalProps {
  title?: string;
  onClose: () => void;
  onSave?: () => void;
  showButtons?: boolean;
  isSaving?: boolean;
  children: React.ReactNode;
}

const BaseModal = ({
  title,
  onClose,
  onSave,
  showButtons = true,
  isSaving,
  children,
}: BaseModalProps) => {
  return (
    <div className="base-modal__overlay" onClick={onClose}>
      <div className="base-modal__card" onClick={(e) => e.stopPropagation()}>
        {title && <div className="base-modal__header">{title}</div>}

        <div className="base-modal__body">{children}</div>

        {showButtons && (
          <div className="base-modal__actions">
            <button
              className="btn-edit"
              onClick={() => onSave?.()}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button className="btn-delete" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;
