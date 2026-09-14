import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as machineActions from "../../redux/machines";
import type { Machine } from "../../types";
import BaseModal from "../BaseModal/BaseModal";
import "../BaseModal/BaseModal.css";

interface Props {
  machine: Machine;
  open: boolean;
  onClose: () => void;
}

export default function EditMachineModal({ machine, open, onClose }: Props) {
  const dispatch = useDispatch<any>();

  // prefill with existing values
  const [name, setName] = useState(machine.name);
  const [price, setPrice] = useState(String(machine.price));
  const [condition, setCondition] = useState(machine.condition);
  const [description, setDescription] = useState<string>(
    machine.description ?? "",
  );
  const [hoursUsed, setHoursUsed] = useState(
    machine.hours_used !== null && machine.hours_used !== undefined
      ? String(machine.hours_used)
      : "",
  );
  const [seoTitle, setSeoTitle] = useState(machine.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(
    machine.seo_description || "",
  );
  const [bestFor, setBestFor] = useState(machine.best_for || "");
  const [notFor, setNotFor] = useState(machine.not_for || "");
  const [keyBenefits, setKeyBenefits] = useState(machine.key_benefits || "");
  const [commonUses, setCommonUses] = useState(machine.common_uses || "");
  const [faq, setFaq] = useState(machine.faq || "");
  const [comparisonNotes, setComparisonNotes] = useState(
    machine.comparison_notes || "",
  );
  const [slug, setSlug] = useState(machine.slug || "");

  // keep modal in sync if parent passes a different machine
  useEffect(() => {
    setName(machine.name);
    setPrice(String(machine.price));
    setCondition(machine.condition);
    setDescription(machine.description ?? "");
    setHoursUsed(
      machine.hours_used !== null && machine.hours_used !== undefined
        ? String(machine.hours_used)
        : "",
    );
    setSeoTitle(machine.seo_title || "");
    setSeoDescription(machine.seo_description || "");
    setBestFor(machine.best_for || "");
    setNotFor(machine.not_for || "");
    setKeyBenefits(machine.key_benefits || "");
    setCommonUses(machine.common_uses || "");
    setFaq(machine.faq || "");
    setComparisonNotes(machine.comparison_notes || "");
    setSlug(machine.slug || "");
  }, [machine]);

  const handleSave = async () => {
    await dispatch(
      machineActions.editMachine(machine.id, {
        name,
        price: parseFloat(price),
        condition,
        description,
        hours_used: hoursUsed === "" ? (null as any) : Number(hoursUsed),
        seo_title: seoTitle,
        seo_description: seoDescription,
        best_for: bestFor,
        not_for: notFor,
        key_benefits: keyBenefits,
        common_uses: commonUses,
        faq,
        comparison_notes: comparisonNotes,
        slug,
      }),
    );
    // optional: refresh the list so cards reflect server truth
    await dispatch(machineActions.getMachines());
    onClose();
  };

  if (!open) return null;

  return (
    <BaseModal title="Edit Machine" onClose={onClose} onSave={handleSave}>
      <input
        className="modal-input"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="modal-input"
        placeholder="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        className="modal-input"
        placeholder="Condition"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
      />
      <textarea
        className="modal-textarea"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        className="modal-input"
        placeholder="Hours Used"
        type="number"
        value={hoursUsed}
        onChange={(e) => setHoursUsed(e.target.value)}
      />

      <input
        className="modal-input"
        placeholder="SEO Title"
        value={seoTitle}
        onChange={(e) => setSeoTitle(e.target.value)}
      />

      <textarea
        className="modal-textarea"
        placeholder="SEO Description"
        value={seoDescription}
        onChange={(e) => setSeoDescription(e.target.value)}
      />

      <textarea
        className="modal-textarea"
        placeholder="Best For"
        value={bestFor}
        onChange={(e) => setBestFor(e.target.value)}
      />

      <textarea
        className="modal-textarea"
        placeholder="Not Ideal For"
        value={notFor}
        onChange={(e) => setNotFor(e.target.value)}
      />

      <textarea
        className="modal-textarea"
        placeholder="Key Benefits"
        value={keyBenefits}
        onChange={(e) => setKeyBenefits(e.target.value)}
      />

      <textarea
        className="modal-textarea"
        placeholder="Common Uses"
        value={commonUses}
        onChange={(e) => setCommonUses(e.target.value)}
      />

      <textarea
        className="modal-textarea"
        placeholder="FAQ"
        value={faq}
        onChange={(e) => setFaq(e.target.value)}
      />

      <textarea
        className="modal-textarea"
        placeholder="Comparison Notes"
        value={comparisonNotes}
        onChange={(e) => setComparisonNotes(e.target.value)}
      />

      <input
        className="modal-input"
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
    </BaseModal>
  );
}
