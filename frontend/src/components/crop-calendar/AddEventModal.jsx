import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

function AddEventModal({ isOpen, onClose, selectedDate, onEventAdded, eventToEdit }) {
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState("irrigation");
  const [cropName, setCropName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setActivityType(eventToEdit.activityType || "irrigation");
      setCropName(eventToEdit.cropName || "");
      setNotes(eventToEdit.notes || "");
    } else {
      setTitle("");
      setActivityType("irrigation");
      setCropName("");
      setNotes("");
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (eventToEdit) {
        await axiosInstance.patch(`/v1/farmer-events/${eventToEdit._id}`, {
          title,
          activityType,
          cropName,
          notes,
          scheduledDate: eventToEdit.scheduledDate, // preserve date
        });
      } else {
        await axiosInstance.post("/v1/farmer-events", {
          title,
          activityType,
          cropName,
          notes,
          scheduledDate: selectedDate.toISOString(),
        });
      }
      onEventAdded();
      onClose();
    } catch (err) {
      console.error(err);
      setError(`Failed to ${eventToEdit ? 'edit' : 'add'} event. Make sure you are logged in.`);
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!eventToEdit;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      backdropFilter: "blur(4px)"
    }}>
      <div style={{ background: "#fff", padding: "28px", borderRadius: "20px", width: "420px", maxWidth: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", color: "#14532d", fontSize: "20px", fontWeight: 800 }}>
          {isEdit ? "Edit Activity" : `Plan for ${selectedDate?.toLocaleDateString()}`}
        </h3>
        {error && <div style={{ color: "#b91c1c", background: "#fef2f2", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", border: "1px solid #f87171" }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#374151" }}>Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "15px", fontFamily: "inherit" }} placeholder="e.g. Irrigate Field A" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#374151" }}>Activity Type *</label>
            <select value={activityType} onChange={e => setActivityType(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "15px", fontFamily: "inherit" }}>
              <option value="sowing">Sowing</option>
              <option value="irrigation">Irrigation</option>
              <option value="fertilizing">Fertilizing</option>
              <option value="harvesting">Harvesting</option>
              <option value="spraying">Spraying</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#374151" }}>Crop Name</label>
            <input value={cropName} onChange={e => setCropName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "15px", fontFamily: "inherit" }} placeholder="e.g. Wheat" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#374151" }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #d1d5db", minHeight: "80px", fontSize: "15px", fontFamily: "inherit" }} placeholder="Add any details..." />
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#f3f4f6", color: "#4b5563", fontWeight: 700, cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e5e7eb"} onMouseOut={e => e.currentTarget.style.background = "#f3f4f6"}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(22,163,74,0.3)", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEventModal;
