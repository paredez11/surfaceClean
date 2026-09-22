// front3/src/pages/SalesArchivesPage/SalesArchivesPage.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { salesActions } from "../../redux";
import type { RootState } from "../../redux/store";
import type { SaleDetail } from "../../types/sale";
import { formatCurrency, formatDate } from "../../utils/formatters";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";

import MachineCard from "../../components/MachineCard/MachineCard";

import "./SalesArchivesPage.css";

const SalesArchivesPage = () => {
  const dispatch = useDispatch<any>();
  const [saleToDeliver, setSaleToDeliver] = useState<number | null>(null);

  const sales = useSelector(
    (state: RootState) => Object.values(state.sales.all) as SaleDetail[],
  );

  useEffect(() => {
    dispatch(salesActions.getSales());
  }, [dispatch]);

  const archivedSales = sales
    .filter(
      (sale) =>
        sale.status === "sold" ||
        sale.status === "delivered" ||
        sale.status === "cancelled",
    )
    .sort((a, b) => {
      const aTime = a.sold_at ? new Date(a.sold_at).getTime() : 0;
      const bTime = b.sold_at ? new Date(b.sold_at).getTime() : 0;

      return bTime - aTime;
    });

  const getCustomerName = (sale: SaleDetail) => {
    const customer = sale.customer;

    if (customer.business_name) {
      return customer.business_name;
    }

    const fullName = [customer.first_name, customer.last_name]
      .filter(Boolean)
      .join(" ");

    return fullName || `Customer #${customer.id}`;
  };

  const handleMarkDelivered = async (saleId: number) => {
    await dispatch(
      salesActions.editSale(saleId, {
        status: "delivered",
      }),
    );

    await dispatch(salesActions.getSales());
  };

  return (
    <main className="sales-archive-page">
      <section className="sales-archive-header">
        <div>
          <h1>Sales Archive</h1>
          <p>Sold, delivered, and cancelled Surface Clean equipment.</p>
        </div>
      </section>

      {archivedSales.length === 0 ? (
        <p>No sales history yet.</p>
      ) : (
        <ul className="sales-archive-grid">
          {archivedSales.map((sale) => (
            <li key={sale.id} className="sales-archive-card">
              <Link
                to={`/sales/${sale.id}`}
                className="sales-archive-card-link"
              >
                <div
                  className={`sales-archive-machine ${
                    sale.status === "cancelled"
                      ? "sales-archive-machine--cancelled"
                      : ""
                  }`}
                >
                  {sale.status === "cancelled" && (
                    <span className="sales-status-overlay cancelled">
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
                </div>

                <div className="sales-archive-info">
                  <div>
                    <span>Customer</span>
                    <strong>{getCustomerName(sale)}</strong>
                  </div>

                  <div>
                    <span>Asking Price</span>
                    <strong>{formatCurrency(sale.asking_price)}</strong>
                  </div>

                  <div>
                    <span>Sale Price</span>
                    <strong>{formatCurrency(sale.sale_price)}</strong>
                  </div>

                  <div>
                    <span>Sold</span>
                    <strong>{formatDate(sale.sold_at)}</strong>
                  </div>

                  {sale.status === "delivered" && (
                    <div>
                      <span>Delivered</span>
                      <strong>{formatDate(sale.delivered_at)}</strong>
                    </div>
                  )}

                  {sale.status === "cancelled" && (
                    <div>
                      <span>Status</span>
                      <strong>Cancelled</strong>
                    </div>
                  )}

                  {sale.status === "sold" && (
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => setSaleToDeliver(sale.id)}
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </Link>

              <Link
                to={`/customers/${sale.customer.id}`}
                className="sales-customer-link"
              >
                VIEW CUSTOMER
              </Link>
            </li>
          ))}
        </ul>
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
    </main>
  );
};

export default SalesArchivesPage;
