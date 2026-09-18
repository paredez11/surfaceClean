import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useModal } from "../../context/Modal";
import LoginModal from "../../components/LoginModal/LoginModal";
import { useEffect } from "react";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setModalContent } = useModal();
  const user = useSelector((state: RootState) => state.session.user);

  const links = [
    { path: "/machines", label: "🧹 Machines" },
    { path: "/testimonials", label: "⭐ Testimonials" },
    { path: "/faqs", label: "❓ FAQs" },
    { path: "/contact", label: "📞 Contact" },
    { path: "/about", label: "ℹ️ About" },
  ];

  useEffect(() => {
    if (location.pathname === "/admin" && !user) {
      setModalContent(<LoginModal />);
    }
  }, [location.pathname, user, setModalContent]);

  return (
    <div className="home-container">
      <h2 className="home-heading">Welcome to Surface Clean</h2>
      <div className="home-buttons">
        {links.map(({ path, label }) => (
          <button key={path} className="home-button" onClick={() => navigate(path)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default HomePage;