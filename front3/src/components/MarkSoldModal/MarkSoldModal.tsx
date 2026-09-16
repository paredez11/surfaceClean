// front3/src/components/MarkSoldModal/MarkSoldModal.tsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as salesActions from "../../redux/sales";
import * as customerActions from "../../redux/customers";
import type { RootState } from "../../redux/store";
import type { Customer } from "../../types/customer";

import BaseModal from "../BaseModal/BaseModal";
import AddCustomerModal from "../AddCustomerModal/AddCustomerModal";

import "../BaseModal/BaseModal.css";

interface Props {
  machineId: number;
  askingPrice: number;
  open: boolean;
  onClose: () => void;
}

export default function MarkSoldModal({
  machineId,
  askingPrice,
  open,
  onClose,
}: Props) {
  const dispatch = useDispatch<any>();

  const customers = useSelector((state: RootState) =>
    Object.values(state.customers.all),
  );

  const [salePrice, setSalePrice] = useState(String(askingPrice));
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(customerActions.getCustomers());
    }
  }, [dispatch, open]);

  useEffect(() => {
    setSalePrice(String(askingPrice));
  }, [askingPrice, open]);

  const handleCustomerCreated = (customer: Customer) => {
    setCustomerId(customer.id);
    setShowAddCustomer(false);
  };

  const handleSave = async () => {
    const parsedSalePrice = Number(salePrice);

    if (
      !customerId ||
      !Number.isFinite(parsedSalePrice) ||
      parsedSalePrice < 0
    ) {
      return;
    }

    await dispatch(
      salesActions.createSale({
        customer_id: customerId,
        machine_id: machineId,
        asking_price: askingPrice,
        sale_price: parsedSalePrice,
        status: "sold",
        notes: notes || null,
      }),
    );

    onClose();
  };

  if (!open) return null;

  return (
    <>
      <BaseModal
        title="Mark Machine Sold"
        onClose={onClose}
        onSave={handleSave}
      >
        <select
          className="modal-input"
          value={customerId ?? ""}
          onChange={(e) =>
            setCustomerId(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Select Customer</option>

          {customers.map((customer) => {
            const customerName =
              customer.customer_type === "business"
                ? customer.business_name ||
                  `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
                : `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() ||
                  customer.business_name;

            return (
              <option key={customer.id} value={customer.id}>
                {customerName || `Customer #${customer.id}`}
              </option>
            );
          })}
        </select>

        <button
          type="button"
          className="add-customer-button"
          onClick={() => setShowAddCustomer(true)}
        >
          ADD NEW CUSTOMER
        </button>

        <input
          className="modal-input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Sale Price"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
        />

        <textarea
          className="modal-textarea"
          placeholder="Sale Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </BaseModal>

      <AddCustomerModal
        open={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCreated={handleCustomerCreated}
      />
    </>
  );
}