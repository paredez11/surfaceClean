// front3/src/components/EditCustomerModal/EditCustomerModal.tsx

import { useState } from "react";
import { useDispatch } from "react-redux";

import BaseModal from "../BaseModal/BaseModal";
import type { Customer } from "../../types/customer";
import * as customerActions from "../../redux/customers";

interface EditCustomerModalProps {
  customer: Customer;
  onClose: () => void;
}

const EditCustomerModal = ({
  customer,
  onClose,
}: EditCustomerModalProps) => {
  const dispatch = useDispatch<any>();

  const [customerType, setCustomerType] = useState(customer.customer_type);
  const [firstName, setFirstName] = useState(customer.first_name ?? "");
  const [lastName, setLastName] = useState(customer.last_name ?? "");
  const [businessName, setBusinessName] = useState(
    customer.business_name ?? "",
  );
  const [email, setEmail] = useState(customer.email ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [addressLine1, setAddressLine1] = useState(
    customer.address_line_1 ?? "",
  );
  const [addressLine2, setAddressLine2] = useState(
    customer.address_line_2 ?? "",
  );
  const [city, setCity] = useState(customer.city ?? "");
  const [state, setState] = useState(customer.state ?? "");
  const [postalCode, setPostalCode] = useState(
    customer.postal_code ?? "",
  );
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      await dispatch(
        customerActions.editCustomer(customer.id, {
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

      onClose();
    } catch (err) {
      console.error("Update customer failed:", err);
      setModalError("Something went wrong while updating the customer.");
    }
  };

  return (
    <BaseModal
      title="Edit Customer"
      onClose={onClose}
      onSave={handleSave}
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
        type="email"
        placeholder="Email"
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
  );
};

export default EditCustomerModal;