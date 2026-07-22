import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

function AddEventModal({ isOpen, onClose, selectedDate, onEventAdded }) {
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState("irrigation");
  const [cropName, setCropName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post("/v1/farmer-events", {
        title,
        activityType,
        cropName,
        notes,
        scheduledDate: selectedDate.toISOString(),
      });
      onEventAdded();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to add event. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", width: "400px", maxWidth: "90%" }}>
        <h3 style={{ margin: "0 0 16px", color: "#14532d" }}>Add Event on {selectedDate.toLocaleDateString()}</h3>
        {error && <div style={{ color: "red", fontSize: "12px", marginBottom: "12px" }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="e.g. Irrigate Field A" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Activity Type *</label>
            <select value={activityType} onChange={e => setActivityType(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
              <option value="sowing">Sowing</option>
              <option value="irrigation">Irrigation</option>
              <option value="fertilizing">Fertilizing</option>
              <option value="harvesting">Harvesting</option>
              <option value="spraying">Spraying</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Crop Name</label>
            <input value={cropName} onChange={e => setCropName(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="e.g. Wheat" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", minHeight: "60px" }} />
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#f3f4f6", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#16a34a", color: "#fff", cursor: "pointer" }}>
              {loading ? "Adding..." : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEventModal;
