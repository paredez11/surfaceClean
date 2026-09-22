// front3/src/components/MachineCard/MachineCard.tsx

import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { machineActions, salesActions } from "../../redux";
import { Machine, Sale } from "../../types";
import type { Image } from "../../types";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import EditMachineModal from "../EditMachineModal/EditMachineModal";
import MarkSoldModal from "../MarkSoldModal/MarkSoldModal";
import "./MachineCard.css";

interface MachineCardProps {
  machine: Machine;
  showAdminActions?: boolean;
  displayStatus?: "listed" | "sold" | "delivered" | null;
}

const MachineCard = ({
  machine,
  showAdminActions = true,
  displayStatus,
}: MachineCardProps) => {
  const dispatch = useDispatch<any>();
  const user = useSelector((state: RootState) => state.session.user);
  const updatedMachine = useSelector(
    (state: RootState) => state.machines.all[machine.id],
  );
  const sales = useSelector((state: RootState) =>
    Object.values(state.sales.all),
  );

  const [name, setName] = useState(machine.name);
  const [price, setPrice] = useState(machine.price);
  const [condition, setCondition] = useState(machine.condition);
  const [hoursUsed, setHoursUsed] = useState(machine.hours_used ?? 0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMarkSold, setShowMarkSold] = useState(false);

  useEffect(() => {
    if (updatedMachine) {
      setName(updatedMachine.name);
      setPrice(updatedMachine.price);
      setCondition(updatedMachine.condition);
      setHoursUsed(updatedMachine.hours_used ?? 0);
    }
  }, [updatedMachine]);

  const currentStatus = updatedMachine?.status ?? machine.status;
  const statusForDisplay =
    displayStatus === undefined ? currentStatus : displayStatus;
  const machineForDisplay = updatedMachine ?? machine;

  const handleDelete = () => setShowConfirm(true);

  const activeSale = sales.find(
    (sale) => sale.machine_id === machine.id && sale.status === "sold",
  );

  const handleMarkDelivered = async () => {
    if (!activeSale) {
      console.error("No active sale found for machine:", machine.id);
      return;
    }

    await dispatch(
      salesActions.editSale(activeSale.id, {
        status: "delivered",
      }),
    );

    await dispatch(machineActions.getMachines());
  };

  const confirmDelete = () => {
    dispatch(machineActions.removeMachine(machine.id));
    setShowConfirm(false);
  };

  return (
    <div className="machine-card">
      {(statusForDisplay === "sold" || statusForDisplay === "delivered") && (
        <span className="machine-status-overlay">
          {statusForDisplay === "sold" ? "SOLD" : "DELIVERED"}
        </span>
      )}
      <NavLink
        to={`/machines/${machine.id}`}
        key="view"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="machine-details">
          <h3 className="machine-name">{name}</h3>

          <div className="machine-image-container">
            {(updatedMachine?.images ?? machine.images)?.[0]?.url && (
              <img
                src={(updatedMachine?.images ?? machine.images)![0].url.replace(
                  "/upload/",
                  "/upload/q_auto,f_auto,w_600/",
                )}
                alt={`${name} preview`}
                className="machine-image"
              />
            )}
          </div>

          <p className="machine-price">Price: ${price}</p>

          <p className="machine-condition">
            <strong>Condition:</strong> {condition}
          </p>

          <p className="machine-hours">
            Hours Used: {parseInt((hoursUsed ?? 0).toString(), 10)} hrs
          </p>
          {machineForDisplay.has_warranty &&
            machineForDisplay.warranty_duration &&
            machineForDisplay.warranty_duration_unit && (
              <div className="machine-warranty">
                <strong>
                  Includes {machineForDisplay.warranty_duration}{" "}
                  {machineForDisplay.warranty_duration === 1
                    ? machineForDisplay.warranty_duration_unit.replace(/s$/, "")
                    : machineForDisplay.warranty_duration_unit}{" "}
                  Warranty
                </strong>

                {machineForDisplay.warranty_notes && (
                  <span>{machineForDisplay.warranty_notes}</span>
                )}
              </div>
            )}
        </div>
      </NavLink>

      {user && showAdminActions && (
        <div className="machine-actions">
          <button onClick={() => setShowEdit(true)} className="btn-edit">
            EDIT
          </button>

          {currentStatus === "listed" && (
            <button onClick={() => setShowMarkSold(true)} className="btn-edit">
              MARK SOLD
            </button>
          )}

          {currentStatus === "sold" && (
            <button onClick={handleMarkDelivered} className="btn-edit">
              MARK DELIVERED
            </button>
          )}

          <button onClick={handleDelete} className="btn-delete">
            DELETE
          </button>
        </div>
      )}

      {showConfirm && (
        <ConfirmationModal
          title="Confirm Deletion"
          message="Are you sure you want to delete this machine?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showEdit && (
        <EditMachineModal
          machine={updatedMachine ?? machine}
          open={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showMarkSold && (
        <MarkSoldModal
          machineId={machine.id}
          askingPrice={price}
          open={showMarkSold}
          onClose={() => setShowMarkSold(false)}
        />
      )}
    </div>
  );
};

export default MachineCard;
