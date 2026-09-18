// components/Navigation/Navigation.tsx

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import "./Navigation.css";

function Navigation() {
  const user = useSelector((state: RootState) => state.session.user);
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitles: Record<string, string> = {
    "/": "Surface Clean",
    "/admin": "🔒 Admin",
    "/machines": "Machines",
    "/images": "Images",
    "/testimonials": "Testimonials",
    "/faqs": "FAQs",
    "/about": "About",
    "/contact": "Contact",
  };

  const currentTitle = pageTitles[location.pathname] || "Surface Clean";

  return (
    <nav className="navbar">
      <button className="brand-btn" onClick={() => navigate("/")}>
        <img src="/favicon.png" alt="Surface Clean" className="brand-logo" />
      </button>

      <h1 className="nav-title">{currentTitle}</h1>

      <ul className="nav-list">
        <li>
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/machines" className="nav-link">
            Machines
          </NavLink>
        </li>
        <li>
          <NavLink to="/testimonials" className="nav-link">
            Testimonials
          </NavLink>
        </li>
        <li>
          <NavLink to="/faqs" className="nav-link">
            FAQs
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className="nav-link">
            Contact
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className="nav-link">
            About
          </NavLink>
        </li>

        {user && (
          <li>
            <NavLink to="/admin" className="nav-link">
              Admin
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;