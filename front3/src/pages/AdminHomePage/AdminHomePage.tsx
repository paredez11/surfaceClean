// src/pages/AdminHomePage/AdminHomePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useModal } from "../../context/Modal";
import LoginModal from "../../components/LoginModal/LoginModal";
import ChangePasswordModal from "../../components/ChangePasswordModal/ChangePasswordModal";
import "./AdminHomePage.css";

function AdminHomePage() {
  const navigate = useNavigate();
  const { setModalContent } = useModal();
  const user = useSelector((state: RootState) => state.session.user);
  const [showChangePw, setShowChangePw] = useState(false);

  useEffect(() => {
    if (!user) setModalContent(<LoginModal />);
  }, [user, setModalContent]);

  const adminLinks = [
    { path: "/machines", label: "🧹 Manage Machines/Parts" },
    { path: "/customers", label: "👥 Manage Customers"},
    { path: "/testimonials", label: "⭐ Manage Testimonials" },
    { path: "/faqs", label: "❓ Manage FAQs" },
  ];

  return (
    <>
      <div className="page-wrapper">
        <button className="btn-delete" onClick={() => setShowChangePw(true)}>
          Change Password
        </button>
      </div>
      <div className="admin-home-container">
        <h2 className="admin-home-heading">Admin Dashboard</h2>
        <div className="admin-home-buttons">
          {adminLinks.map(({ path, label }) => (
            <button
              key={path}
              className="admin-home-button"
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Render the modal in this tree and control with state */}
        <ChangePasswordModal
          open={showChangePw}
          onClose={() => setShowChangePw(false)}
        />
      </div>
    </>
  );
}

export default AdminHomePage;
