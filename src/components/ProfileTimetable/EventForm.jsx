// src/components/ProfileTimetable/EventForm.jsx
import React, { useState, useEffect } from "react";
import "../../styles/ProfileTimetable/EventForm.css";

const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const eventTypes = ["event", "class"];
const hoursRange = Array.from({ length: 17 }, (_, i) => i + 6); // 6–22

const DEBUG = true;
const dlog = (...args) => DEBUG && console.log("[EventForm]", ...args);

export default function EventForm({ existingEvent, onClose, onSave, onDelete }) {
  const normalizeHour = (h, fallback) => {
    const n = Number(h);
    return Number.isFinite(n) ? n : fallback;
  };

  const [formData, setFormData] = useState({
    title: existingEvent?.title || "",
    description: existingEvent?.description || "",
    date: existingEvent?.date || "",
    day: existingEvent?.day || "",
    startHour: normalizeHour(existingEvent?.startHour, 6),
    endHour: normalizeHour(existingEvent?.endHour, 7),
    location: existingEvent?.location || "",
    onlineLink: existingEvent?.onlineLink || "",
    type: existingEvent?.type?.toLowerCase() || "event",
    recurring: existingEvent?.recurring || false,
    recurrenceWeeks: Number(existingEvent?.recurrenceWeeks) || 1,
  });

  const [showOnlineLink, setShowOnlineLink] = useState(
    (existingEvent?.location || "").toLowerCase() === "online"
  );
  const [showRecurrenceWeeks, setShowRecurrenceWeeks] = useState(
    (existingEvent?.type?.toLowerCase() || "event") === "class" && !!existingEvent?.recurring
  );
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // success / error message

  // --- DEBUG on mount
  useEffect(() => {
    dlog("Mounted with props:", { existingEvent, hasOnSave: !!onSave, hasOnDelete: !!onDelete });
    dlog("Initial formData:", formData);
  }, []);

  // Auto-set day based on date
  useEffect(() => {
    if (formData.date) {
      const dateObj = new Date(formData.date);
      const dayName = daysOfWeek[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1];
      setFormData(prev => ({ ...prev, day: dayName }));
      dlog("Auto-set day from date:", { date: formData.date, day: dayName });
    }
  }, [formData.date]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = value;
    if (["startHour", "endHour", "recurrenceWeeks"].includes(name)) {
      nextValue = Number(value);
    }
    if (type === "checkbox") nextValue = checked;

    setFormData(prev => {
      const next = { ...prev, [name]: nextValue };
      dlog("Field change:", { name, value: nextValue, updatedFormData: next });

      if (name === "location") {
        const isOnline = String(nextValue).toLowerCase() === "online";
        setShowOnlineLink(isOnline);
        if (!isOnline) next.onlineLink = "";
      }

      if (name === "type") {
        const isClass = String(nextValue).toLowerCase() === "class";
        setShowRecurrenceWeeks(isClass && next.recurring);
      }

      if (name === "recurring") {
        const isClass = next.type === "class";
        setShowRecurrenceWeeks(!!nextValue && isClass);
      }

      return next;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.date) newErrors.date = "Select a date.";
    if (!Number.isFinite(Number(formData.startHour))) newErrors.startHour = "Start hour is required.";
    if (!Number.isFinite(Number(formData.endHour))) newErrors.endHour = "End hour is required.";
    if (Number(formData.startHour) >= Number(formData.endHour)) {
      newErrors.endHour = "End hour must be after start hour.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validateForm()) {
      setStatus({ type: "error", message: "Please fix the errors above." });
      return;
    }

    if (!onSave) {
      console.error("[EventForm] onSave is not provided, cannot submit");
      setStatus({ type: "error", message: "Save function not available." });
      return;
    }

    const payload = {
      ...formData,
      type: String(formData.type).toLowerCase(),
      startHour: Number(formData.startHour),
      endHour: Number(formData.endHour),
    };

    // Only include id if editing an existing event
    if (existingEvent?.id) {
      payload.id = existingEvent.id;
    }

    dlog("Submitting payload to parent:", payload);

    try {
      await onSave(payload);
      setStatus({ type: "success", message: "Event saved successfully!" });
      setTimeout(() => onClose?.(), 500); // small delay for feedback
    } catch (err) {
      console.error("[EventForm] onSave error:", err);
      setStatus({ type: "error", message: "Failed to save event." });
    }
  };

  const handleDelete = async () => {
    if (!existingEvent?.id) return;
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await onDelete(existingEvent.id);
      setStatus({ type: "success", message: "Event deleted successfully!" });
      setTimeout(() => onClose?.(), 500);
    } catch (err) {
      console.error("[EventForm] onDelete error:", err);
      setStatus({ type: "error", message: "Failed to delete event." });
    }
  };

  return (
    <div className="tt-event-form-container">
      <form onSubmit={handleSubmit} className="tt-event-form">
        <h3 className="tt-form-title">{existingEvent?.id ? "Edit Event" : "Add Event"}</h3>

        {status && (
          <div className={`tt-status ${status.type}`}>
            {status.message}
          </div>
        )}

        {errors.form && <div className="tt-form-error">{errors.form}</div>}

        <label>
          Title
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="E.g., Mathematics Lecture"
          />
          {errors.title && <span className="tt-field-error">{errors.title}</span>}
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional details or notes..."
          />
        </label>

        <label>
          Type
          <select name="type" value={formData.type} onChange={handleChange}>
            {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <label>
          Date
          <input type="date" name="date" value={formData.date} onChange={handleChange} />
          {errors.date && <span className="tt-field-error">{errors.date}</span>}
        </label>

        <label>
          Day
          <select name="day" value={formData.day} onChange={handleChange}>
            <option value="">Select a day</option>
            {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <div className="tt-time-row">
          <label>
            Start Hour
            <select name="startHour" value={formData.startHour} onChange={handleChange}>
              {hoursRange.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            {errors.startHour && <span className="tt-field-error">{errors.startHour}</span>}
          </label>
          <label>
            End Hour
            <select name="endHour" value={formData.endHour} onChange={handleChange}>
              {hoursRange.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            {errors.endHour && <span className="tt-field-error">{errors.endHour}</span>}
          </label>
        </div>

        <label>
          Location
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder='E.g., "Room 101" or "Online"'
          />
        </label>

        {showOnlineLink && (
          <label>
            Online Link
            <input
              type="url"
              name="onlineLink"
              value={formData.onlineLink}
              onChange={handleChange}
              placeholder="https://…"
            />
          </label>
        )}

        <label className="tt-checkbox">
          Recurring
          <input type="checkbox" name="recurring" checked={formData.recurring} onChange={handleChange} />
        </label>

        {showRecurrenceWeeks && (
          <label>
            Recurrence Weeks
            <input
              type="number"
              min={1}
              max={52}
              name="recurrenceWeeks"
              value={formData.recurrenceWeeks}
              onChange={handleChange}
            />
          </label>
        )}

        <div className="tt-form-buttons">
          <button type="submit" className="tt-btn-save">
            {existingEvent?.id ? "Update" : "Save"}
          </button>
          {existingEvent?.id && (
            <button type="button" className="tt-btn-delete" onClick={handleDelete}>
              🗑 Delete
            </button>
          )}
          <button type="button" className="tt-btn-cancel" onClick={() => onClose?.()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
