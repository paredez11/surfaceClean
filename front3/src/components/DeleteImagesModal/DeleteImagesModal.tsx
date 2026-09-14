import { useMemo, useState } from "react";
import BaseModal from "../BaseModal/BaseModal";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { useDispatch } from "react-redux";
import * as imagesActions from "../../redux/images";
import type { Image } from "../../types";
import "./DeleteImagesModal.css";

interface Props {
  open: boolean;
  onClose: () => void;
  images: Image[]; // thumbnails to render
  machineId: number; // for refresh callback up top
  onDeleted?: () => void; // parent can refresh details after delete
}

export default function DeleteImagesModal({
  open,
  onClose,
  images,
  machineId,
  onDeleted,
}: Props) {
  const dispatch = useDispatch<any>();
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(
    () => images.slice().sort((a, b) => a.id - b.id),
    [images]
  );

  if (!open) return null;

  const togglePick = (id: number) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!picked.size) return onClose();
    setConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setConfirm(false);
    setBusy(true);
    try {
      await Promise.all(
        Array.from(picked).map((id) => dispatch(imagesActions.removeImage(id)))
      );
      onDeleted?.();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <BaseModal title="Delete Image(s)" onClose={onClose} showButtons={false}>
        <p style={{ marginBottom: 8 }}>Select one or more images to delete.</p>

        <div className="del-grid">
          {sorted.map((img, idx) => (
            <label
              key={img.id}
              className={`del-cell ${picked.has(img.id) ? "picked" : ""}`}
            >
              <input
                type="checkbox"
                checked={picked.has(img.id)}
                onChange={() => togglePick(img.id)}
              />
              <img
                src={img.url.replace(
                  "/upload/",
                  "/upload/f_auto,q_auto,w_200/"
                )}
                alt={`Image ${idx + 1}`}
              />
            </label>
          ))}
        </div>

        {busy && <p style={{ marginTop: 8 }}>Deleting…</p>}
        <div className="base-modal__actions">
          <button className="btn-delete" onClick={handleSave}>
            Delete
          </button>
          <button className="btn-edit" onClick={onClose}>
            Cancel
          </button>
        </div>
      </BaseModal>

      {confirm && (
        <ConfirmationModal
          title="Confirm Deletion"
          message={`Delete ${picked.size} image${
            picked.size === 1 ? "" : "s"
          }? This cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  );
}
