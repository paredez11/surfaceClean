// front3/src/pages/WarrantiesPage/WarrantiesPage.tsx

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { warrantiesActions } from "../../redux";
import type { RootState } from "../../redux/store";
import type { WarrantyListItem } from "../../types/warranty";
import { formatDate } from "../../utils/formatters";

import "./WarrantiesPage.css";

const WarrantiesPage = () => {
  const dispatch = useDispatch<any>();

  const { active, loading, error } = useSelector(
    (state: RootState) => state.warranties,
  );

  useEffect(() => {
    dispatch(warrantiesActions.getActiveWarranties());
  }, [dispatch]);

  const getCustomerName = (warranty: WarrantyListItem) => {
    const customer = warranty.customer;

    if (customer.business_name) {
      return customer.business_name;
    }

    const fullName = [customer.first_name, customer.last_name]
      .filter(Boolean)
      .join(" ");

    return fullName || `Customer #${customer.id}`;
  };

  const isExpiringSoon = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return end >= now && end <= thirtyDaysFromNow;
  };

  if (loading) {
    return (
      <main className="warranties-page">
        <section className="warranties-header">
          <div>
            <h1>Active Warranties</h1>
            <p>Surface Clean equipment currently under warranty.</p>
          </div>
        </section>

        <p>Loading warranties...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="warranties-page">
        <section className="warranties-header">
          <div>
            <h1>Active Warranties</h1>
            <p>Surface Clean equipment currently under warranty.</p>
          </div>
        </section>

        <div className="warranties-error">
          <p>{error}</p>

          <button
            type="button"
            className="btn-edit"
            onClick={() => dispatch(warrantiesActions.getActiveWarranties())}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="warranties-page">
      <section className="warranties-header">
        <div>
          <h1>Active Warranties</h1>
          <p>Surface Clean equipment currently under warranty.</p>
        </div>
      </section>

      {active.length === 0 ? (
        <p>No active warranties.</p>
      ) : (
        <ul className="warranties-grid">
          {active.map((warranty: WarrantyListItem) => {
            const expiringSoon = isExpiringSoon(warranty.end_date);

            return (
              <li key={warranty.id} className="warranty-card">
                <div className="warranty-machine">
                  {expiringSoon && (
                    <span className="warranty-status-overlay">
                      EXPIRING SOON
                    </span>
                  )}

                  <h2>{warranty.machine.name}</h2>
                </div>

                <div className="warranty-info">
                  <div>
                    <span>Customer</span>
                    <strong>{getCustomerName(warranty)}</strong>
                  </div>

                  <div>
                    <span>Warranty Start</span>
                    <strong>{formatDate(warranty.start_date)}</strong>
                  </div>

                  <div>
                    <span>Warranty End</span>
                    <strong>{formatDate(warranty.end_date)}</strong>
                  </div>

                  <div>
                    <span>Duration</span>
                    <strong>
                      {warranty.duration} {warranty.duration_unit}
                      {warranty.duration !== 1 ? "s" : ""}
                    </strong>
                  </div>
                </div>

                <Link
                  to={`/customers/${warranty.customer.id}`}
                  className="warranty-customer-link"
                >
                  VIEW CUSTOMER
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
};

export default WarrantiesPage;
