// front3/src/components/AddMachineModal/AddMachineModal.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as machineActions from "../../redux/machines";
import * as imageActions from "../../redux/images";
import ImageUploader from "../ImageUploader/ImageUploader";
import BaseModal from "../BaseModal/BaseModal";
import "../BaseModal/BaseModal.css";

const AddMachineModal = () => {
  const dispatch = useDispatch<any>();
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [hoursUsed, setHoursUsed] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [notFor, setNotFor] = useState("");
  const [keyBenefits, setKeyBenefits] = useState("");
  const [commonUses, setCommonUses] = useState("");
  const [faq, setFaq] = useState("");
  const [comparisonNotes, setComparisonNotes] = useState("");
  const [slug, setSlug] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const created = await dispatch(
        machineActions.createMachine({
          name,
          price: parseFloat(price),
          condition,
          description,
          hours_used: parseInt(hoursUsed),
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

      await dispatch(machineActions.getMachines());
      setShowModal(false);

      if (created?.id && files.length > 0) {
        (async () => {
          try {
            await Promise.all(
              files.map((file) => {
                const form = new FormData();
                form.append("file", file);
                form.append("machine_id", String(created.id));
                form.append("description", "");
                return dispatch(imageActions.createImage(form)).catch((e: any) => {
                  console.warn("Failed to upload image:", file.name, e);
                  return null;
                });
              }),
            );

            await dispatch(machineActions.getMachineDetails(created.id));
          } catch (e) {
            console.warn("Image upload failed:", e);
          }
        })();
      }
    } catch (err: any) {
      console.error("Create machine failed:", err);
      if (err?.response?.data?.detail) {
        setModalError(`Machine creation failed: ${err.response.data.detail}`);
      } else {
        setModalError("Something went wrong while creating the machine.");
      }
    } finally {
      setName("");
      setPrice("");
      setCondition("");
      setDescription("");
      setHoursUsed("");
      setFiles([]);
      setSeoTitle("");
      setSeoDescription("");
      setBestFor("");
      setNotFor("");
      setKeyBenefits("");
      setCommonUses("");
      setFaq("");
      setComparisonNotes("");
      setSlug("");
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setModalError(null);
          setShowModal(true);
        }}
        className="add-machine-btn"
      >
        ADD MACHINE or PART
      </button>

      {showModal && (
        <BaseModal
          title="Add Machine or Part"
          onClose={() => setShowModal(false)}
          onSave={handleSubmit}
        >
          {modalError && <div className="modal-error">{modalError}</div>}
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
            placeholder="FAQ (Q: A: format)"
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
            placeholder="Slug (optional)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <ImageUploader onUpload={(fs) => setFiles(fs)} multiple />
        </BaseModal>
      )}
    </>
  );
};

export default AddMachineModal;
