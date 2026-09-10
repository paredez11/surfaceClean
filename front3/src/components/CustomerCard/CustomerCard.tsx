// front3/src/components/CustomerCard/CustomerCard.tsx

import { NavLink } from "react-router-dom";
import { Customer } from "../../redux/customers";
import "./CustomerCard.css";

interface CustomerCardProps {
  customer: Customer;
}

const CustomerCard = ({ customer }: CustomerCardProps) => {
  const customerName =
    customer.business_name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Unnamed Customer";

  const contactName =
    customer.business_name && (customer.first_name || customer.last_name)
      ? [customer.first_name, customer.last_name].filter(Boolean).join(" ")
      : null;

  const location = [customer.city, customer.state].filter(Boolean).join(", ");

  return (
    <NavLink
      to={`/customers/${customer.id}`}
      className="customer-card-link"
    >
      <div className="customer-card">
        <div className="customer-details">
          <h3 className="customer-name">{customerName}</h3>

          <p className="customer-type">
            {customer.customer_type === "business"
              ? "Business Customer"
              : "Individual Customer"}
          </p>

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

          {location && (
            <p>
              <strong>Location:</strong> {location}
            </p>
          )}
        </div>
      </div>
    </NavLink>
  );
};

export default CustomerCard;
