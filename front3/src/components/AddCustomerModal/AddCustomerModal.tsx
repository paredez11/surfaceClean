// front3/src/components/AddCustomerModal/AddCustomerModal.tsx

import { useState } from "react";
import { useDispatch } from "react-redux";

import * as customerActions from "../../redux/customers";
import type { Customer } from "../../types/customer";

import BaseModal from "../BaseModal/BaseModal";
import "../BaseModal/BaseModal.css";

interface AddCustomerModalProps {
  open?: boolean;
  onClose?: () => void;
  onCreated?: (customer: Customer) => void;
}

const AddCustomerModal = ({
  open,
  onClose,
  onCreated,
}: AddCustomerModalProps) => {
  const dispatch = useDispatch<any>();

  const [showModal, setShowModal] = useState(false);

  const [customerType, setCustomerType] = useState("business");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : showModal;

  const resetForm = () => {
    setCustomerType("business");
    setFirstName("");
    setLastName("");
    setBusinessName("");
    setEmail("");
    setPhone("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setPostalCode("");
    setNotes("");
    setModalError(null);
  };

  const handleClose = () => {
    if (isControlled) {
      onClose?.();
    } else {
      setShowModal(false);
    }

    resetForm();
  };

  const handleSubmit = async () => {
    try {
      const customer = await dispatch(
        customerActions.createCustomer({
          customer_type: customerType,
          first_name: firstName || null,
          last_name: lastName || null,
          business_name: businessName || null,
          email: email || null,
          phone: phone || null,
          address_line_1: addressLine1 || null,
          address_line_2: addressLine2 || null,
          city: city || null,
          state: state || null,
          postal_code: postalCode || null,
          notes: notes || null,
        }),
      );

      await dispatch(customerActions.getCustomers());

      onCreated?.(customer);

      if (isControlled) {
        onClose?.();
      } else {
        setShowModal(false);
      }

      resetForm();
    } catch (err: any) {
      console.error("Create customer failed:", err);

      if (err?.response?.data?.detail) {
        setModalError(`Customer creation failed: ${err.response.data.detail}`);
      } else {
        setModalError("Something went wrong while creating the customer.");
      }
    }
  };

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => {
            setModalError(null);
            setShowModal(true);
          }}
          className="add-customer-button"
        >
          ADD CUSTOMER
        </button>
      )}

      {isOpen && (
        <BaseModal
          title="Add Customer"
          onClose={handleClose}
          onSave={handleSubmit}
        >
          {modalError && <div className="modal-error">{modalError}</div>}

          <select
            className="modal-input"
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
          >
            <option value="business">Business</option>
            <option value="individual">Individual</option>
          </select>

          <input
            className="modal-input"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="Address Line 1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="Address Line 2"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />

          <textarea
            className="modal-textarea"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </BaseModal>
      )}
    </>
  );
};

export default AddCustomerModal;