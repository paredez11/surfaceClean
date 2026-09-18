// front3/src/pages/CustomerDetailsPage/CustomerDetailsPage.tsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useParams, useNavigate } from "react-router-dom";

import { customerActions, salesActions } from "../../redux";
import type { RootState } from "../../redux/store";

import EditCustomerModal from "../../components/EditCustomerModal/EditCustomerModal";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import MachineCard from "../../components/MachineCard/MachineCard";

import { formatCurrency, formatDate } from "../../utils/formatters";

import "./CustomerDetailsPage.css";

const CustomerDetailsPage = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<number | null>(null);
  const [saleToDeliver, setSaleToDeliver] = useState<number | null>(null);

  const { customerId } = useParams();

  const customer = useSelector((state: RootState) => state.customers.single);

  useEffect(() => {
    if (customerId) {
      dispatch(customerActions.getCustomerDetails(customerId));
    }
  }, [dispatch, customerId]);

  if (!customer) {
    return (
      <main className="customer-details-page">
        <p>Loading customer...</p>
      </main>
    );
  }

  const customerName =
    customer.business_name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Unnamed Customer";

  const contactName =
    customer.business_name && (customer.first_name || customer.last_name)
      ? [customer.first_name, customer.last_name].filter(Boolean).join(" ")
      : null;

  const address = [
    customer.address_line_1,
    customer.address_line_2,
    [customer.city, customer.state].filter(Boolean).join(", "),
    customer.postal_code,
  ].filter(Boolean);

  const handleMarkDelivered = async (saleId: number) => {
    await dispatch(
      salesActions.editSale(saleId, {
        status: "delivered",
      }),
    );

    if (customerId) {
      await dispatch(customerActions.getCustomerDetails(customerId));
    }
  };

  const handleCancelSale = async (saleId: number) => {
    await dispatch(
      salesActions.editSale(saleId, {
        status: "cancelled",
      }),
    );

    if (customerId) {
      await dispatch(customerActions.getCustomerDetails(customerId));
    }
  };

  const handleDelete = async () => {
    if (!customer) return;

    try {
      setDeleteError(null);

      await dispatch(customerActions.removeCustomer(customer.id));

      navigate("/customers");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete customer.";

      setDeleteError(message);
      setShowDeleteModal(false);
    }
  };

  return (
    <main className="customer-details-page">
      <NavLink to="/customers" className="customer-back-link">
        ← Back to Customers
      </NavLink>

      <section className="customer-details-header">
        <div>
          <h1>{customerName}</h1>

          <p>
            {customer.customer_type === "business"
              ? "Business Customer"
              : "Individual Customer"}
          </p>
        </div>

        <div className="customer-details-actions">
          <button className="btn-edit" onClick={() => setShowEditModal(true)}>
            Edit Customer
          </button>

          <button
            className="btn-delete"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Customer
          </button>
        </div>
      </section>

      <section className="customer-info-card">
        <h2>Contact Information</h2>

        {contactName && (
          <p>
            <strong>Contact:</strong> {contactName}
          </p>
        )}

        {customer.phone && (
          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>
        )}

        {customer.email && (
          <p>
            <strong>Email:</strong> {customer.email}
          </p>
        )}

        {address.length > 0 && (
          <div className="customer-address">
            <strong>Address:</strong>

            {address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        )}

        {customer.notes && (
          <p>
            <strong>Notes:</strong> {customer.notes}
          </p>
        )}
      </section>

      {customer.sales?.length > 0 && (
        <section className="customer-history-section">
          <h2>Purchases</h2>

          <div className="customer-history-list customer-purchases-list">
            {customer.sales.map((sale) => {
              return (
                <div
                  key={sale.id}
                  className={`customer-purchase-wrapper ${
                    sale.status === "cancelled"
                      ? "customer-purchase-wrapper--cancelled"
                      : ""
                  }`}
                >
                  {sale.status === "cancelled" && (
                    <span className="customer-purchase-cancelled-stamp">
                      CANCELLED
                    </span>
                  )}

                  <MachineCard
                    machine={sale.machine}
                    showAdminActions={false}
                    displayStatus={
                      sale.status === "cancelled" ? null : sale.status
                    }
                  />

                  <div className="customer-purchase-details">
                    <p>
                      <strong>Sale Price:</strong>{" "}
                      {formatCurrency(sale.sale_price)}
                    </p>

                    <p>
                      <strong>Sold:</strong> {formatDate(sale.sold_at)}
                    </p>

                    {sale.delivered_at && (
                      <p>
                        <strong>Delivered:</strong>{" "}
                        {formatDate(sale.delivered_at)}
                      </p>
                    )}

                    <p>
                      <strong>Status:</strong> {sale.status}
                    </p>

                    {sale.delivery_address_line_1 && (
                      <div className="customer-purchase-delivery">
                        <strong>Delivery:</strong>

                        <span>{sale.delivery_address_line_1}</span>

                        {sale.delivery_address_line_2 && (
                          <span>{sale.delivery_address_line_2}</span>
                        )}

                        <span>
                          {[sale.delivery_city, sale.delivery_state]
                            .filter(Boolean)
                            .join(", ")}{" "}
                          {sale.delivery_postal_code}
                        </span>
                      </div>
                    )}

                    <div className="customer-purchase-actions">
                      <button
                        type="button"
                        onClick={() => navigate(`/machines/${sale.machine.id}`)}
                      >
                        View Machine
                      </button>

                      {sale.status === "sold" && (
                        <>
                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() => setSaleToDeliver(sale.id)}
                          >
                            Mark Delivered
                          </button>

                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => setSaleToCancel(sale.id)}
                          >
                            Cancel Sale
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {customer.sales?.some((sale) => sale.warranty !== null) && (
        <section className="customer-history-section">
          <h2>Warranty</h2>

          <div className="customer-history-list">
            {customer.sales.map((sale) => {
              const warranty = sale.warranty;

              if (!warranty) return null;

              return (
                <div key={warranty.id} className="customer-history-item">
                  <h3>{sale.machine.name}</h3>

                  <p>
                    <strong>Status:</strong> {warranty.status}
                  </p>

                  <p>
                    <strong>Coverage:</strong> {warranty.duration}{" "}
                    {warranty.duration_unit}
                  </p>

                  <p>
                    <strong>Starts:</strong> {formatDate(warranty.start_date)}
                  </p>

                  <p>
                    <strong>Ends:</strong> {formatDate(warranty.end_date)}
                  </p>

                  {warranty.coverage_terms && (
                    <p>
                      <strong>Terms:</strong> {warranty.coverage_terms}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {customer.sales?.some((sale) => sale.service_records.length > 0) && (
        <section className="customer-history-section">
          <h2>Service History</h2>

          <div className="customer-history-list">
            {customer.sales.flatMap((sale) =>
              sale.service_records.map((record) => (
                <div key={record.id} className="customer-history-item">
                  <h3>{sale.machine.name}</h3>

                  <p>
                    <strong>Service Date:</strong>{" "}
                    {formatDate(record.service_date)}
                  </p>

                  <p>
                    <strong>Type:</strong> {record.service_type}
                  </p>

                  <p>
                    <strong>Warranty:</strong>{" "}
                    {record.covered_by_warranty ? "Covered" : "Not Covered"}
                  </p>

                  {record.work_performed && (
                    <p>
                      <strong>Work Performed:</strong> {record.work_performed}
                    </p>
                  )}

                  {record.total_cost !== null && (
                    <p>
                      <strong>Total Cost:</strong>{" "}
                      {formatCurrency(record.total_cost)}
                    </p>
                  )}

                  {record.technician && (
                    <p>
                      <strong>Technician:</strong> {record.technician}
                    </p>
                  )}
                </div>
              )),
            )}
          </div>
        </section>
      )}

      {deleteError && <p className="customer-delete-error">{deleteError}</p>}

      {showEditModal && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          title="Delete Customer"
          message={`Delete ${customerName}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {saleToDeliver !== null && (
        <ConfirmationModal
          title="Mark Machine Delivered"
          message="Are you sure you want to mark this machine as delivered?"
          onConfirm={async () => {
            await handleMarkDelivered(saleToDeliver);
            setSaleToDeliver(null);
          }}
          onCancel={() => setSaleToDeliver(null)}
        />
      )}

      {saleToCancel !== null && (
        <ConfirmationModal
          title="Cancel Sale"
          message="Are you sure you want to cancel this sale? The machine will return to available inventory."
          onConfirm={async () => {
            await handleCancelSale(saleToCancel);
            setSaleToCancel(null);
          }}
          onCancel={() => setSaleToCancel(null)}
        />
      )}
    </main>
  );
};

export default CustomerDetailsPage;
