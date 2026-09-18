// front3/src/components/MarkSoldModal/MarkSoldModal.tsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as salesActions from "../../redux/sales";
import * as customerActions from "../../redux/customers";
import type { RootState } from "../../redux/store";
import type { Customer } from "../../types/customer";

import BaseModal from "../BaseModal/BaseModal";
import "./MarkSoldModal.css";
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

  const [useCustomerAddressForBilling, setUseCustomerAddressForBilling] =
    useState(true);

  const [billingAddressLine1, setBillingAddressLine1] = useState("");
  const [billingAddressLine2, setBillingAddressLine2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");

  const [deliverySameAsBilling, setDeliverySameAsBilling] = useState(true);

  const [deliveryAddressLine1, setDeliveryAddressLine1] = useState("");
  const [deliveryAddressLine2, setDeliveryAddressLine2] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCustomer = customers.find(
    (customer) => customer.id === customerId,
  );

  useEffect(() => {
    if (open) {
      dispatch(customerActions.getCustomers());
    }
  }, [dispatch, open]);

  useEffect(() => {
    if (!open) return;

    setSalePrice(String(askingPrice));
    setCustomerId(null);
    setNotes("");

    setUseCustomerAddressForBilling(true);

    setBillingAddressLine1("");
    setBillingAddressLine2("");
    setBillingCity("");
    setBillingState("");
    setBillingPostalCode("");

    setDeliverySameAsBilling(true);

    setDeliveryAddressLine1("");
    setDeliveryAddressLine2("");
    setDeliveryCity("");
    setDeliveryState("");
    setDeliveryPostalCode("");

    setError(null);
    setIsSubmitting(false);
  }, [askingPrice, open]);

  useEffect(() => {
    if (!selectedCustomer || !useCustomerAddressForBilling) return;

    setBillingAddressLine1(selectedCustomer.address_line_1 ?? "");
    setBillingAddressLine2(selectedCustomer.address_line_2 ?? "");
    setBillingCity(selectedCustomer.city ?? "");
    setBillingState(selectedCustomer.state ?? "");
    setBillingPostalCode(selectedCustomer.postal_code ?? "");
  }, [selectedCustomer, useCustomerAddressForBilling]);

  useEffect(() => {
    if (!deliverySameAsBilling) return;

    setDeliveryAddressLine1(billingAddressLine1);
    setDeliveryAddressLine2(billingAddressLine2);
    setDeliveryCity(billingCity);
    setDeliveryState(billingState);
    setDeliveryPostalCode(billingPostalCode);
  }, [
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingState,
    billingPostalCode,
    deliverySameAsBilling,
  ]);

  const handleCustomerCreated = (customer: Customer) => {
    setCustomerId(customer.id);
    setShowAddCustomer(false);
    setError(null);
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    setError(null);

    const parsedSalePrice = Number(salePrice);

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (
      !salePrice.trim() ||
      !Number.isFinite(parsedSalePrice) ||
      parsedSalePrice < 0
    ) {
      setError("Please enter a valid sale price.");
      return;
    }

    if (
      !billingAddressLine1.trim() ||
      !billingCity.trim() ||
      !billingState.trim() ||
      !billingPostalCode.trim()
    ) {
      setError("Billing address, city, state, and ZIP code are required.");
      return;
    }

    if (
      !deliverySameAsBilling &&
      (!deliveryAddressLine1.trim() ||
        !deliveryCity.trim() ||
        !deliveryState.trim() ||
        !deliveryPostalCode.trim())
    ) {
      setError("Delivery address, city, state, and ZIP code are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      await dispatch(
        salesActions.createSale({
          customer_id: customerId,
          machine_id: machineId,

          asking_price: askingPrice,
          sale_price: parsedSalePrice,

          status: "sold",

          billing_address_line_1: billingAddressLine1.trim(),
          billing_address_line_2: billingAddressLine2.trim() || null,
          billing_city: billingCity.trim(),
          billing_state: billingState.trim(),
          billing_postal_code: billingPostalCode.trim(),

          delivery_same_as_billing: deliverySameAsBilling,

          delivery_address_line_1: deliveryAddressLine1.trim() || null,
          delivery_address_line_2: deliveryAddressLine2.trim() || null,
          delivery_city: deliveryCity.trim() || null,
          delivery_state: deliveryState.trim() || null,
          delivery_postal_code: deliveryPostalCode.trim() || null,

          notes: notes.trim() || null,
        }),
      );

      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to complete the sale.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <BaseModal
        title="Mark Machine Sold"
        onClose={onClose}
        onSave={handleSave}
        isSaving={isSubmitting}
      >
        <div className="mark-sold-form">
          <section className="mark-sold-section">
            <h3 className="mark-sold-section-title">Customer</h3>

            <select
              className="modal-input"
              value={customerId ?? ""}
              onChange={(e) => {
                setCustomerId(e.target.value ? Number(e.target.value) : null);
                setError(null);
              }}
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
          </section>

          <section className="mark-sold-section">
            <h3 className="mark-sold-section-title">Sale</h3>

            <label className="mark-sold-field">
              <span>Sale Price</span>

              <input
                className="modal-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Sale Price"
                value={salePrice}
                onChange={(e) => {
                  setSalePrice(e.target.value);
                  setError(null);
                }}
              />
            </label>
          </section>

          {selectedCustomer && (
            <>
              <section className="mark-sold-section">
                <div className="mark-sold-section-header">
                  <h3 className="mark-sold-section-title">Billing Address</h3>

                  <label className="mark-sold-checkbox">
                    <input
                      type="checkbox"
                      checked={useCustomerAddressForBilling}
                      onChange={(e) => {
                        setUseCustomerAddressForBilling(e.target.checked);
                        setError(null);
                      }}
                    />

                    <span>Use customer's address</span>
                  </label>
                </div>

                <div className="mark-sold-address-grid">
                  <input
                    className="modal-input mark-sold-full-width"
                    type="text"
                    placeholder="Address Line 1"
                    value={billingAddressLine1}
                    disabled={useCustomerAddressForBilling}
                    onChange={(e) => setBillingAddressLine1(e.target.value)}
                  />

                  <input
                    className="modal-input mark-sold-full-width"
                    type="text"
                    placeholder="Address Line 2"
                    value={billingAddressLine2}
                    disabled={useCustomerAddressForBilling}
                    onChange={(e) => setBillingAddressLine2(e.target.value)}
                  />

                  <input
                    className="modal-input"
                    type="text"
                    placeholder="City"
                    value={billingCity}
                    disabled={useCustomerAddressForBilling}
                    onChange={(e) => setBillingCity(e.target.value)}
                  />

                  <input
                    className="modal-input"
                    type="text"
                    placeholder="State"
                    value={billingState}
                    disabled={useCustomerAddressForBilling}
                    onChange={(e) => setBillingState(e.target.value)}
                  />

                  <input
                    className="modal-input"
                    type="text"
                    placeholder="ZIP Code"
                    value={billingPostalCode}
                    disabled={useCustomerAddressForBilling}
                    onChange={(e) => setBillingPostalCode(e.target.value)}
                  />
                </div>
              </section>

              <section className="mark-sold-section">
                <div className="mark-sold-section-header">
                  <h3 className="mark-sold-section-title">Delivery Address</h3>

                  <label className="mark-sold-checkbox">
                    <input
                      type="checkbox"
                      checked={deliverySameAsBilling}
                      onChange={(e) => {
                        setDeliverySameAsBilling(e.target.checked);
                        setError(null);
                      }}
                    />

                    <span>Same as billing</span>
                  </label>
                </div>

                {deliverySameAsBilling ? (
                  <p className="mark-sold-helper">
                    This machine will be delivered to the billing address above.
                  </p>
                ) : (
                  <div className="mark-sold-address-grid">
                    <input
                      className="modal-input mark-sold-full-width"
                      type="text"
                      placeholder="Address Line 1"
                      value={deliveryAddressLine1}
                      onChange={(e) => setDeliveryAddressLine1(e.target.value)}
                    />

                    <input
                      className="modal-input mark-sold-full-width"
                      type="text"
                      placeholder="Address Line 2"
                      value={deliveryAddressLine2}
                      onChange={(e) => setDeliveryAddressLine2(e.target.value)}
                    />

                    <input
                      className="modal-input"
                      type="text"
                      placeholder="City"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                    />

                    <input
                      className="modal-input"
                      type="text"
                      placeholder="State"
                      value={deliveryState}
                      onChange={(e) => setDeliveryState(e.target.value)}
                    />

                    <input
                      className="modal-input"
                      type="text"
                      placeholder="ZIP Code"
                      value={deliveryPostalCode}
                      onChange={(e) => setDeliveryPostalCode(e.target.value)}
                    />
                  </div>
                )}
              </section>
            </>
          )}

          <section className="mark-sold-section">
            <h3 className="mark-sold-section-title">Notes</h3>

            <textarea
              className="modal-textarea"
              placeholder="Sale Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>

          {error && <p className="modal-error mark-sold-error">{error}</p>}

          {isSubmitting && <p className="modal-submitting">Saving sale...</p>}
        </div>
      </BaseModal>

      <AddCustomerModal
        open={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCreated={handleCustomerCreated}
      />
    </>
  );
}