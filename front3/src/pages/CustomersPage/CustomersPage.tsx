// front3/src/pages/CustomersPage/CustomersPage.tsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomerCard from "../../components/CustomerCard";
import { customerActions } from "../../redux";
import type { RootState } from "../../redux/store";

import "./CustomersPage.css";
import AddCustomerModal from "../../components/AddCustomerModal/AddCustomerModal";

const CustomersPage = () => {
  const dispatch = useDispatch<any>();

  const customers = useSelector((state: RootState) => state.customers.all);

  const loading = useSelector((state: RootState) => state.customers.loading);

  useEffect(() => {
    dispatch(customerActions.getCustomers());
  }, [dispatch]);

  const customerList = Object.values(customers).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <main className="customers-page">
      <div className="customers-header">
        <div>
          <h1>Customers</h1>
          <p>Manage Surface Clean customer records and account history.</p>
        </div>

        <AddCustomerModal />
      </div>

      {loading ? (
        <p className="customers-message">Loading customers...</p>
      ) : customerList.length === 0 ? (
        <p className="customers-message">No customers have been added yet.</p>
      ) : (
        <div className="customers-grid">
          {customerList.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </main>
  );
};

export default CustomersPage;
