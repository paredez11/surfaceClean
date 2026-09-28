// src/pages/AdminHomePage/AdminHomePage.tsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useModal } from "../../context/Modal";
import { getDashboard } from "../../redux/dashboard";
import type { RootState } from "../../redux/store";

import ChangePasswordModal from "../../components/ChangePasswordModal/ChangePasswordModal";
import LoginModal from "../../components/LoginModal/LoginModal";

import "./AdminHomePage.css";


function AdminHomePage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { setModalContent } = useModal();

  const user = useSelector((state: RootState) => state.session.user);

  const {
    data: dashboard,
    loading,
    error,
  } = useSelector((state: RootState) => state.dashboard);

  const [showChangePw, setShowChangePw] = useState(false);

  useEffect(() => {
    if (!user) {
      setModalContent(<LoginModal />);
      return;
    }

    dispatch(getDashboard());
  }, [user, dispatch, setModalContent]);

  const adminLinks = [
    { path: "/machines", label: "🧹 Manage Machines" },
    { path: "/customers", label: "👥 Manage Customers" },
    { path: "/sales", label: "💵 Sales Archives" },
    { path: "/testimonials", label: "⭐ Manage Testimonials" },
    { path: "/faqs", label: "❓ Manage FAQs" },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));

  const attentionLabel = (type: string) => {
    switch (type) {
      case "awaiting_delivery":
        return "Awaiting Delivery";

      case "warranty_expiring":
        return "Warranty Expiring";

      default:
        return "Needs Attention";
    }
  };

  const activityLabel = (type: string) => {
    switch (type) {
      case "sale":
        return "Sale";

      case "delivery":
        return "Delivery";

      case "service":
        return "Service";

      default:
        return "Activity";
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <button
          className="btn-delete"
          onClick={() => setShowChangePw(true)}
        >
          Change Password
        </button>
      </div>

      <main className="admin-home-container">
        <div className="admin-dashboard-header">
          <div>
            <h1 className="admin-home-heading">
              Admin Dashboard
            </h1>

            <p className="admin-dashboard-subheading">
              Surface Clean business overview
            </p>
          </div>
        </div>

        <section className="dashboard-section admin-navigation-section">
          <h2 className="dashboard-section-title">
            Admin Navigation
          </h2>

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
        </section>

        {loading && !dashboard && (
          <div className="dashboard-message">
            Loading dashboard...
          </div>
        )}

        {error && !dashboard && (
          <div className="dashboard-message dashboard-error">
            {error}
          </div>
        )}

        {dashboard && (
          <>
            <section className="dashboard-section">
              <h2 className="dashboard-section-title">
                Business Overview
              </h2>

              <div className="dashboard-summary-grid">
                <button
                  className="dashboard-card dashboard-card-button"
                  onClick={() => navigate("/machines")}
                >
                  <span className="dashboard-card-label">
                    Available Inventory
                  </span>

                  <strong className="dashboard-card-value">
                    {dashboard.inventory.available}
                  </strong>
                </button>

                <button
                  className="dashboard-card dashboard-card-button"
                  onClick={() => navigate("/sales")}
                >
                  <span className="dashboard-card-label">
                    Awaiting Delivery
                  </span>

                  <strong className="dashboard-card-value">
                    {dashboard.inventory.awaiting_delivery}
                  </strong>
                </button>

                <button
                  className="dashboard-card dashboard-card-button"
                  onClick={() => navigate("/customers")}
                >
                  <span className="dashboard-card-label">
                    Customers
                  </span>

                  <strong className="dashboard-card-value">
                    {dashboard.business.customers}
                  </strong>
                </button>

                <button
                  className="dashboard-card dashboard-card-button"
                  onClick={() => navigate("/sales")}
                >
                  <span className="dashboard-card-label">
                    Completed Sales
                  </span>

                  <strong className="dashboard-card-value">
                    {dashboard.business.completed_sales}
                  </strong>
                </button>

                <div className="dashboard-card">
                  <span className="dashboard-card-label">
                    Recorded Revenue
                  </span>

                  <strong className="dashboard-card-value">
                    {formatCurrency(
                      dashboard.business.total_revenue,
                    )}
                  </strong>
                </div>

                <div className="dashboard-card">
                  <span className="dashboard-card-label">
                    Active Warranties
                  </span>

                  <strong className="dashboard-card-value">
                    {dashboard.warranties.active}
                  </strong>

                  {dashboard.warranties.expiring_soon > 0 && (
                    <span className="dashboard-card-detail">
                      {dashboard.warranties.expiring_soon} expiring soon
                    </span>
                  )}
                </div>

                <div className="dashboard-card">
                  <span className="dashboard-card-label">
                    Service Records
                  </span>

                  <strong className="dashboard-card-value">
                    {dashboard.service.total_records}
                  </strong>

                  <span className="dashboard-card-detail">
                    {dashboard.service.warranty_covered} warranty ·{" "}
                    {dashboard.service.non_warranty} non-warranty
                  </span>
                </div>

                <div className="dashboard-card">
                  <span className="dashboard-card-label">
                    Recorded Service Costs
                  </span>

                  <strong className="dashboard-card-value">
                    {formatCurrency(
                      dashboard.service.total_cost,
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <div className="dashboard-detail-grid">
              <section className="dashboard-section dashboard-panel">
                <h2 className="dashboard-section-title">
                  Needs Attention
                </h2>

                {dashboard.needs_attention.length === 0 ? (
                  <div className="dashboard-empty">
                    Nothing needs attention right now.
                  </div>
                ) : (
                  <div className="dashboard-list">
                    {dashboard.needs_attention.map((item) => (
                      <button
                        key={`${item.type}-${item.sale_id}`}
                        className="dashboard-list-item"
                        onClick={() => navigate("/sales")}
                      >
                        <div className="dashboard-list-content">
                          <span className="dashboard-item-type">
                            {attentionLabel(item.type)}
                          </span>

                          <strong>
                            {item.machine_name}
                          </strong>

                          <span className="dashboard-item-customer">
                            {item.customer_name}
                          </span>
                        </div>

                        <span className="dashboard-item-date">
                          {formatDate(item.date)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="dashboard-section dashboard-panel">
                <h2 className="dashboard-section-title">
                  Recent Activity
                </h2>

                {dashboard.recent_activity.length === 0 ? (
                  <div className="dashboard-empty">
                    No recent activity yet.
                  </div>
                ) : (
                  <div className="dashboard-list">
                    {dashboard.recent_activity.map(
                      (item, index) => (
                        <div
                          key={`${item.type}-${item.date}-${index}`}
                          className="dashboard-list-item dashboard-activity-item"
                        >
                          <div className="dashboard-list-content">
                            <span className="dashboard-item-type">
                              {activityLabel(item.type)}
                            </span>

                            <strong>
                              {item.machine_name}
                            </strong>

                            <span className="dashboard-item-customer">
                              {item.customer_name}
                            </span>
                          </div>

                          <span className="dashboard-item-date">
                            {formatDate(item.date)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </section>
            </div>

            {error && (
              <div className="dashboard-message dashboard-error">
                Dashboard refresh failed: {error}
              </div>
            )}
          </>
        )}
      </main>

      <ChangePasswordModal
        open={showChangePw}
        onClose={() => setShowChangePw(false)}
      />
    </>
  );
}

export default AdminHomePage;