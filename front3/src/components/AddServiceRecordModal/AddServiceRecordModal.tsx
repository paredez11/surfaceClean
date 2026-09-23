// src/components/AddServiceRecordModal/AddServiceRecordModal.tsx

import { useState } from "react";

import BaseModal from "../BaseModal/BaseModal";

interface AddServiceRecordModalProps {
  machineName: string;
  hasWarranty: boolean;
  onClose: () => void;
  onSave: (serviceRecord: {
    service_type: string;
    reported_issue: string | null;
    diagnosis: string | null;
    work_performed: string | null;
    service_date?: string;
    covered_by_warranty: boolean;
    labor_cost: number | null;
    parts_cost: number | null;
    total_cost: number | null;
    technician: string | null;
    notes: string | null;
  }) => Promise<void>;
}

const AddServiceRecordModal = ({
  machineName,
  hasWarranty,
  onClose,
  onSave,
}: AddServiceRecordModalProps) => {
  const [serviceType, setServiceType] = useState("");
  const [issueReported, setIssueReported] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [coveredByWarranty, setCoveredByWarranty] = useState(false);
  const [laborCost, setLaborCost] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const calculateTotalCost = () => {
    const labor = laborCost ? Number(laborCost) : 0;
    const parts = partsCost ? Number(partsCost) : 0;

    return labor + parts;
  };

  const handleSave = async () => {
    setError("");

    if (!serviceType.trim()) {
      setError("Service type is required.");
      return;
    }

    const parsedLaborCost = laborCost ? Number(laborCost) : null;
    const parsedPartsCost = partsCost ? Number(partsCost) : null;

    if (
      parsedLaborCost !== null &&
      (Number.isNaN(parsedLaborCost) || parsedLaborCost < 0)
    ) {
      setError("Labor cost must be a valid positive amount.");
      return;
    }

    if (
      parsedPartsCost !== null &&
      (Number.isNaN(parsedPartsCost) || parsedPartsCost < 0)
    ) {
      setError("Parts cost must be a valid positive amount.");
      return;
    }

    const totalCost =
      parsedLaborCost !== null || parsedPartsCost !== null
        ? (parsedLaborCost ?? 0) + (parsedPartsCost ?? 0)
        : null;

    try {
      setSaving(true);

      const serviceRecord = {
        service_type: serviceType.trim(),
        reported_issue: issueReported.trim() || null,
        diagnosis: diagnosis.trim() || null,
        work_performed: workPerformed.trim() || null,
        covered_by_warranty: hasWarranty ? coveredByWarranty : false,
        labor_cost: parsedLaborCost,
        parts_cost: parsedPartsCost,
        total_cost: totalCost,
        technician: technicianName.trim() || null,
        notes: notes.trim() || null,
      };

      await onSave({
        ...serviceRecord,
        ...(serviceDate ? { service_date: serviceDate } : {}),
      });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create service record.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      title="Add Service Record"
      onClose={onClose}
      onSave={handleSave}
      isSaving={saving}
    >
      <p>
        <strong>Machine:</strong> {machineName}
      </p>

      {error && <p className="modal-error">{error}</p>}

      <label>
        Service Type
        <input
          className="modal-input"
          type="text"
          placeholder="Repair, maintenance, inspection..."
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        />
      </label>

      <label>
        Service Date
        <input
          className="modal-input"
          type="date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
        />
      </label>

      <label>
        Issue Reported
        <textarea
          className="modal-textarea"
          placeholder="What issue did the customer report?"
          value={issueReported}
          onChange={(e) => setIssueReported(e.target.value)}
        />
      </label>

      <label>
        Diagnosis
        <textarea
          className="modal-textarea"
          placeholder="What was diagnosed?"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
      </label>

      <label>
        Work Performed
        <textarea
          className="modal-textarea"
          placeholder="Describe the work performed."
          value={workPerformed}
          onChange={(e) => setWorkPerformed(e.target.value)}
        />
      </label>

      {hasWarranty && (
        <label>
          <input
            type="checkbox"
            checked={coveredByWarranty}
            onChange={(e) => setCoveredByWarranty(e.target.checked)}
          />
          Covered by Warranty
        </label>
      )}

      <label>
        Labor Cost
        <input
          className="modal-input"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={laborCost}
          onChange={(e) => setLaborCost(e.target.value)}
        />
      </label>

      <label>
        Parts Cost
        <input
          className="modal-input"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={partsCost}
          onChange={(e) => setPartsCost(e.target.value)}
        />
      </label>

      <p>
        <strong>Total Cost:</strong> ${calculateTotalCost().toFixed(2)}
      </p>

      <label>
        Technician
        <input
          className="modal-input"
          type="text"
          placeholder="Technician name"
          value={technicianName}
          onChange={(e) => setTechnicianName(e.target.value)}
        />
      </label>

      <label>
        Notes
        <textarea
          className="modal-textarea"
          placeholder="Additional service notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
    </BaseModal>
  );
};

export default AddServiceRecordModal;
