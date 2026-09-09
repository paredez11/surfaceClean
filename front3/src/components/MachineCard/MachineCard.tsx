// front3/src/components/MachineCard/MachineCard.tsx

import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { machineActions } from "../../redux";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import EditMachineModal from "../EditMachineModal/EditMachineModal";
import MarkSoldModal from "../MarkSoldModal/MarkSoldModal";
import "./MachineCard.css";

interface Image {
  id: number;
  url: string;
  description?: string;
  machine_id: number;
}

interface Machine {
  id: number;
  name: string;
  price: number;
  condition: string;
  hours_used: number;
  created_at: string;
  status: "listed" | "sold" | "delivered";
  images?: Image[];
}

interface MachineCardProps {
  machine: Machine;
}

const MachineCard = ({ machine }: MachineCardProps) => {
  const dispatch = useDispatch<any>();
  const user = useSelector((state: RootState) => state.session.user);
  const updatedMachine = useSelector(
    (state: RootState) => state.machines.all[machine.id],
  );

  const [name, setName] = useState(machine.name);
  const [price, setPrice] = useState(machine.price);
  const [condition, setCondition] = useState(machine.condition);
  const [hoursUsed, setHoursUsed] = useState(machine.hours_used);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMarkSold, setShowMarkSold] = useState(false);

  useEffect(() => {
    if (updatedMachine) {
      setName(updatedMachine.name);
      setPrice(updatedMachine.price);
      setCondition(updatedMachine.condition);
      setHoursUsed(updatedMachine.hours_used);
    }
  }, [updatedMachine]);

  const currentStatus = updatedMachine?.status ?? machine.status;

  const handleDelete = () => setShowConfirm(true);

  const handleMarkDelivered = async () => {
    await dispatch(
      machineActions.editMachine(machine.id, {
        status: "delivered",
      }),
    );
  };

  const confirmDelete = () => {
    dispatch(machineActions.removeMachine(machine.id));
    setShowConfirm(false);
  };

  return (
    <div className="machine-card">
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
            Hours Used: {parseInt(hoursUsed.toString(), 10)} hrs
          </p>
        </div>
      </NavLink>

      {user && (
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