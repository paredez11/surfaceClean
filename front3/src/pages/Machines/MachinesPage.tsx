// front3/src/pages/MachinesPage/MachinesPage.tsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { machineActions, salesActions } from "../../redux";
import MachineCard from "../../components/MachineCard/MachineCard";
import AddMachineModal from "../../components/AddMachineModal/AddMachineModal";
import "./MachinesPage.css";
import CallNowButton from "../../components/CallNow/CallNow";

const MachinesPage = () => {
  const dispatch = useDispatch<any>();
  const machines = useSelector((state: RootState) =>
    Object.values(state.machines.all),
  );
  const listedMachines = machines.filter(
    (machine) => machine.status === "listed",
  );
  const user = useSelector((state: RootState) => state.session.user);

  useEffect(() => {
    dispatch(machineActions.getMachines());
    dispatch(salesActions.getSales());
  }, [dispatch]);

  return (
    <div className="machines-page">
      <h1>Available Machines</h1>
      {!user && <CallNowButton />}
      <div className="add-machine-container">{user && <AddMachineModal />}</div>
      <ul className="machine-list">
        {listedMachines.map((m) => (
          <li key={`machine-${m.id}`}>
            <MachineCard machine={m} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MachinesPage;
