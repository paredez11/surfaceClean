// front3/src/pages/SaleDetailsPage/SaleDetailsPage.tsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

import { salesActions } from "../../redux";
import type { RootState } from "../../redux/store";
import type { SaleDetail } from "../../types/sale";
import { formatCurrency, formatDate } from "../../utils/formatters";

import "./SaleDetailsPage.css";

const SaleDetailsPage = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const sale = useSelector(
    (state: RootState) => state.sales.single.details as SaleDetail | null,
  );

  useEffect(() => {
    if (saleId) {
      dispatch(salesActions.getSaleDetails(saleId));
    }
  }, [dispatch, saleId]);

  if (!sale) {
    return <div>Loading...</div>;
  }

  const customerName =
    sale.customer.business_name ||
    [sale.customer.first_name, sale.customer.last_name]
      .filter(Boolean)
      .join(" ") ||
    `Customer #${sale.customer.id}`;


  return (
    <div className="sale-details-page">
      <button className="back-button" onClick={() => navigate("/sales")}>
        Back to Sales Archive
      </button>

      <div className={`sale-status-banner ${sale.status}`}>
        {sale.status === "delivered"
          ? "DELIVERED"
          : sale.status === "cancelled"
            ? "CANCELLED"
            : "SOLD"}
      </div>

      <h1>{sale.machine.name}</h1>

      <section className="sale-details-section">
        <h2>Sale Information</h2>

        <p>
          <strong>Asking Price:</strong> {formatCurrency(sale.asking_price)}
        </p>

        <p>
          <strong>Sale Price:</strong> {formatCurrency(sale.sale_price)}
        </p>

        <p>
          <strong>Sold:</strong> {formatDate(sale.sold_at)}
        </p>

        {sale.delivered_at && (
          <p>
            <strong>Delivered:</strong> {formatDate(sale.delivered_at)}
          </p>
        )}

        {sale.notes && (
          <p>
            <strong>Sale Notes:</strong> {sale.notes}
          </p>
        )}
      </section>

      <section className="sale-details-section">
        <h2>Customer</h2>

        <p>
          <strong>Name:</strong> {customerName}
        </p>

        {sale.customer.email && (
          <p>
            <strong>Email:</strong> {sale.customer.email}
          </p>
        )}

        {sale.customer.phone && (
          <p>
            <strong>Phone:</strong> {sale.customer.phone}
          </p>
        )}

        <Link to={`/customers/${sale.customer.id}`}>View Customer Details</Link>
      </section>

      <section className="sale-details-section">
        <h2>Machine</h2>

        <p>
          <strong>Condition:</strong> {sale.machine.condition}
        </p>

        {sale.machine.hours_used != null && (
          <p>
            <strong>Hours Used:</strong>{" "}
            {parseInt(sale.machine.hours_used.toString(), 10)} hrs
          </p>
        )}

        {sale.machine.description && (
          <p>
            <strong>Description:</strong> {sale.machine.description}
          </p>
        )}

        {sale.machine.equipment_profile && (
          <>
            <h2>About This Model</h2>

            <p>
              <strong>Manufacturer:</strong>{" "}
              {sale.machine.equipment_profile.manufacturer}
            </p>

            <p>
              <strong>Model:</strong> {sale.machine.equipment_profile.model}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {sale.machine.equipment_profile.category}
            </p>

            {sale.machine.equipment_profile.description && (
              <p>
                <strong>About:</strong>{" "}
                {sale.machine.equipment_profile.description}
              </p>
            )}

            {sale.machine.equipment_profile.best_for && (
              <p>
                <strong>Best For:</strong>{" "}
                {sale.machine.equipment_profile.best_for}
              </p>
            )}

            {sale.machine.equipment_profile.not_for && (
              <p>
                <strong>Not Ideal For:</strong>{" "}
                {sale.machine.equipment_profile.not_for}
              </p>
            )}

            {sale.machine.equipment_profile.key_benefits && (
              <p>
                <strong>Key Benefits:</strong>{" "}
                {sale.machine.equipment_profile.key_benefits}
              </p>
            )}

            {sale.machine.equipment_profile.common_uses && (
              <p>
                <strong>Common Uses:</strong>{" "}
                {sale.machine.equipment_profile.common_uses}
              </p>
            )}

            {sale.machine.equipment_profile.specifications && (
              <p>
                <strong>Specifications:</strong>{" "}
                {sale.machine.equipment_profile.specifications}
              </p>
            )}

            {sale.machine.equipment_profile.faq && (
              <p>
                <strong>FAQ:</strong> {sale.machine.equipment_profile.faq}
              </p>
            )}

            {sale.machine.equipment_profile.comparison_notes && (
              <p>
                <strong>Comparison:</strong>{" "}
                {sale.machine.equipment_profile.comparison_notes}
              </p>
            )}

            {sale.machine.equipment_profile.manufacturer_url && (
              <p>
                <strong>Manufacturer:</strong>{" "}
                <a
                  href={sale.machine.equipment_profile.manufacturer_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Manufacturer Information
                </a>
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default SaleDetailsPage;
