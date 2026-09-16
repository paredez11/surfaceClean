// front3/src/pages/SalesArchivesPage/SalesArchivesPage.tsx

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { salesActions } from "../../redux";
import type { RootState } from "../../redux/store";
import type { SaleDetail } from "../../types/sale";

const SalesArchivesPage = () => {
  const dispatch = useDispatch<any>();

  const sales = useSelector(
    (state: RootState) =>
      Object.values(state.sales.all) as SaleDetail[],
  );

  useEffect(() => {
    dispatch(salesActions.getSales());
  }, [dispatch]);

  const archivedSales = sales.filter(
    (sale) =>
      sale.status === "sold" ||
      sale.status === "delivered",
  );

  const formatPrice = (price: number | null) => {
    if (price === null) return "—";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCustomerName = (sale: SaleDetail) => {
    const customer = sale.customer;

    if (customer.business_name) {
      return customer.business_name;
    }

    const fullName = [
      customer.first_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || `Customer #${customer.id}`;
  };

  return (
    <main className="sales-archive-page">
      <section className="sales-archive-header">
        <div>
          <h1>Sales Archive</h1>
          <p>
            Sold and delivered Surface Clean equipment.
          </p>
        </div>
      </section>

      {archivedSales.length === 0 ? (
        <p>No sold equipment yet.</p>
      ) : (
        <ul className="sales-archive-grid">
          {archivedSales.map((sale) => (
            <li
              key={sale.id}
              className="sales-archive-card"
            >
              <Link
                to={`/sales/${sale.id}`}
                className="sales-archive-card-link"
              >
                <div className="sales-archive-machine">
                  <div
                    className={`sales-status-overlay ${sale.status}`}
                  >
                    {sale.status === "delivered"
                      ? "DELIVERED"
                      : "SOLD"}
                  </div>

                  <h2>{sale.machine.name}</h2>
                </div>

                <div className="sales-archive-info">
                  <div>
                    <span>Customer</span>
                    <strong>
                      {getCustomerName(sale)}
                    </strong>
                  </div>

                  <div>
                    <span>Asking Price</span>
                    <strong>
                      {formatPrice(sale.asking_price)}
                    </strong>
                  </div>

                  <div>
                    <span>Sale Price</span>
                    <strong>
                      {formatPrice(sale.sale_price)}
                    </strong>
                  </div>

                  <div>
                    <span>Sold</span>
                    <strong>
                      {formatDate(sale.sold_at)}
                    </strong>
                  </div>

                  {sale.status === "delivered" && (
                    <div>
                      <span>Delivered</span>
                      <strong>
                        {formatDate(sale.delivered_at)}
                      </strong>
                    </div>
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
    </main>
  );
};

export default SalesArchivesPage;