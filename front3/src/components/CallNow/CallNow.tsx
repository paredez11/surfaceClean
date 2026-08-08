import { useState } from "react";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import "./CallNow.css";

interface CallNowButtonProps {
  label?: string;
  phone?: string;
}

const CallNowButton = ({
  label = "CALL NOW!",
  phone = "+19402053616",
}: CallNowButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <>
      <button className="call-now-btn" onClick={() => setShowConfirm(true)}>
        {label}
      </button>

      {showConfirm && (
        <ConfirmationModal
          title="Call Dave Now?"
          message={`Would you like to call Dave at ${phone}?`}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default CallNowButton;