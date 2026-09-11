// front3/src/components/AddMachineModal/AddMachineModal.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import * as machineActions from "../../redux/machines";
import * as imageActions from "../../redux/images";
import ImageUploader from "../ImageUploader/ImageUploader";
import BaseModal from "../BaseModal/BaseModal";
import type { EquipmentProfile } from "../../redux/machines";
import "../BaseModal/BaseModal.css";
import "./AddMachineModal.css";

const AddMachineModal = () => {
  const dispatch = useDispatch<any>();
  const machines = useSelector((state: RootState) =>
    Object.values(state.machines.all),
  );
  const [showModal, setShowModal] = useState(false);
  const [equipmentProfiles, setEquipmentProfiles] = useState<
    EquipmentProfile[]
  >([]);
  const [equipmentProfileId, setEquipmentProfileId] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [showEquipmentOptions, setShowEquipmentOptions] = useState(false);
  const [selectedEquipmentProfile, setSelectedEquipmentProfile] =
    useState<EquipmentProfile | null>(null);

  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [hoursUsed, setHoursUsed] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!showModal) return;

    const loadEquipmentProfiles = async () => {
      try {
        const response = await fetch("/api/equipment_profiles/");

        if (!response.ok) {
          throw new Error("Failed to load equipment profiles");
        }

        const profiles: EquipmentProfile[] = await response.json();
        setEquipmentProfiles(profiles);
      } catch (error) {
        console.error("Failed to load equipment profiles:", error);
        setModalError("Unable to load equipment profiles.");
      }
    };

    loadEquipmentProfiles();
  }, [showModal]);

  const equipmentUsage = machines.reduce<Record<number, number>>(
    (usage, machine) => {
      if (machine.equipment_profile_id) {
        usage[machine.equipment_profile_id] =
          (usage[machine.equipment_profile_id] || 0) + 1;
      }

      return usage;
    },
    {},
  );

  const filteredEquipmentProfiles = equipmentProfiles
    .filter((profile) => {
      const search = equipmentSearch.toLowerCase().trim();

      const searchableText = [
        profile.manufacturer,
        profile.model,
        profile.category,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    })
    .sort((a, b) => {
      const usageDifference =
        (equipmentUsage[b.id] || 0) - (equipmentUsage[a.id] || 0);

      if (usageDifference !== 0) {
        return usageDifference;
      }

      return `${a.manufacturer} ${a.model}`.localeCompare(
        `${b.manufacturer} ${b.model}`,
      );
    });

  const frequentlyUsedProfiles = filteredEquipmentProfiles.filter(
    (profile) => (equipmentUsage[profile.id] || 0) > 0,
  );

  const otherEquipmentProfiles = filteredEquipmentProfiles.filter(
    (profile) => (equipmentUsage[profile.id] || 0) === 0,
  );

  const handleSubmit = async () => {
    if (!equipmentProfileId) {
      setModalError("Please select an equipment profile.");
      return;
    }

    try {
      const created = await dispatch(
        machineActions.createMachine({
          equipment_profile_id: parseInt(equipmentProfileId),
          price: parseFloat(price),
          condition,
          description,
          hours_used: hoursUsed ? parseInt(hoursUsed) : undefined,
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
                return dispatch(imageActions.createImage(form)).catch(
                  (e: any) => {
                    console.warn("Failed to upload image:", file.name, e);
                    return null;
                  },
                );
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
      setPrice("");
      setCondition("");
      setDescription("");
      setHoursUsed("");
      setFiles([]);
      setEquipmentProfileId("");
      setEquipmentSearch("");
      setSelectedEquipmentProfile(null);
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
        ADD MACHINE
      </button>

      {showModal && (
        <BaseModal
          title="Add Machine"
          onClose={() => setShowModal(false)}
          onSave={handleSubmit}
        >
          {modalError && <div className="modal-error">{modalError}</div>}

          <div className="equipment-selector">
            <input
              className="modal-input"
              type="text"
              placeholder="Search equipment..."
              value={equipmentSearch}
              onChange={(e) => {
                setEquipmentSearch(e.target.value);
                setEquipmentProfileId("");
                setSelectedEquipmentProfile(null);
                setShowEquipmentOptions(true);
              }}
              onFocus={() => setShowEquipmentOptions(true)}
            />

            {showEquipmentOptions && (
              <div className="equipment-options">
                {frequentlyUsedProfiles.length > 0 && (
                  <>
                    <div className="equipment-options-heading">
                      Frequently Used
                    </div>

                    {frequentlyUsedProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        className="equipment-option"
                        onClick={() => {
                          setEquipmentProfileId(String(profile.id));
                          setSelectedEquipmentProfile(profile);
                          setEquipmentSearch(
                            `${profile.manufacturer} ${profile.model}`,
                          );
                          setShowEquipmentOptions(false);
                        }}
                      >
                        {profile.manufacturer} {profile.model} —{" "}
                        {profile.category}
                      </button>
                    ))}
                  </>
                )}

                {otherEquipmentProfiles.length > 0 && (
                  <>
                    <div className="equipment-options-heading">
                      All Equipment
                    </div>

                    {otherEquipmentProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        className="equipment-option"
                        onClick={() => {
                          setEquipmentProfileId(String(profile.id));
                          setSelectedEquipmentProfile(profile);
                          setEquipmentSearch(
                            `${profile.manufacturer} ${profile.model}`,
                          );
                          setShowEquipmentOptions(false);
                        }}
                      >
                        {profile.manufacturer} {profile.model} —{" "}
                        {profile.category}
                      </button>
                    ))}
                  </>
                )}

                {filteredEquipmentProfiles.length === 0 && (
                  <div className="equipment-no-results">No equipment found</div>
                )}
              </div>
            )}

            {selectedEquipmentProfile && (
              <div className="equipment-profile-preview">
                <div className="equipment-profile-found">
                  ✓ Equipment data found
                </div>

                <div>
                  {selectedEquipmentProfile.manufacturer}{" "}
                  {selectedEquipmentProfile.model}
                </div>

                <div>{selectedEquipmentProfile.category}</div>
              </div>
            )}
          </div>

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
            placeholder="Machine Notes"
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

          <ImageUploader onUpload={(fs) => setFiles(fs)} multiple />
        </BaseModal>
      )}
    </>
  );
};

export default AddMachineModal;
