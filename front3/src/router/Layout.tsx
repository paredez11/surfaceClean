// src/router/Layout.tsx
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ModalProvider, Modal } from "../context/Modal";
import { RootState } from "../redux/store";
import { thunkLogout, getCurrentUser } from "../redux/session";
import Navigation from "../components/Navigation/Navigation";
import ConfirmationModal from "../components/ConfirmationModal/ConfirmationModal";
import "./Layout.css";

export default function Layout() {
  const dispatch = useDispatch<any>();
  const user = useSelector((state: RootState) => state.session.user);
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin";

  const [showConfirmCall, setShowConfirmCall] = useState(false);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <ModalProvider>
      {user && (
        <div className="admin-banner">
          <span>ADMIN MODE - ACTIVATED</span>
          <button className="logout-btn" onClick={() => dispatch(thunkLogout())}>
            Logout
          </button>
        </div>
      )}

      <Navigation />

      {!user && (
        <>
          <div className="call-now-float">
            <button
              className="call-now-btn"
              onClick={() => setShowConfirmCall(true)}
            >
              Call Now
            </button>
          </div>

          {showConfirmCall && (
            <ConfirmationModal
              title="Call Dave?"
              message="Do you want to call Dave now?"
              onConfirm={() => {
                setShowConfirmCall(false);
                window.location.href = "tel:+19402053616";
              }}
              onCancel={() => setShowConfirmCall(false)}
            />
          )}
        </>
      )}

      <div className="content-container">
        <Outlet />
      </div>

      <Modal />
    </ModalProvider>
  );
}