// front3/src/components/MarkSoldModal/MarkSoldModal.tsx

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as salesActions from "../../redux/sales";
import BaseModal from "../BaseModal/BaseModal";
import "../BaseModal/BaseModal";

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
  const [salePrice, setSalePrice] = useState(String(askingPrice));
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setSalePrice(String(askingPrice));
  }, [askingPrice, open]);

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
    <BaseModal title="Mark Machine Sold" onClose={onClose} onSave={handleSave}>
      <input
        className="modal-input"
        type="number"
        min="0"
        step="0.01"
        placeholder="Sale Price"
        value={salePrice}
        onChange={(e) => setSalePrice(e.target.value)}
      />
    </BaseModal>
  );
}
