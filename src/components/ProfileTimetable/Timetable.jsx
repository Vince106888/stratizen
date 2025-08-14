// File: src/components/ProfileTimetable/Timetable.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  listenToUserEvents,
  deleteUserEvent,
  addUserEvent,
  updateUserEvent,
} from "../../services/db";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/ProfileTimetable/Timetable.css";

const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const encouragementQuotes = [
  "“Don’t count the days, make the days count.” — Muhammad Ali",
  "“The key is in not spending time, but in investing it.” — Stephen R. Covey",
  "“Time you enjoy wasting is not wasted time.” — Marthe Troly-Curtin",
  "“Time is what we want most, but what we use worst.” — William Penn",
  "“Lost time is never found again.” — Benjamin Franklin",
  "“The future depends on what you do today.” — Mahatma Gandhi",
  "“One thing you can’t recycle is wasted time.” — Unknown",
  "“Don’t watch the clock; do what it does. Keep going.” — Sam Levenson",
  "“Better three hours too soon than a minute too late.” — William Shakespeare",
  "“Time flies over us, but leaves its shadow behind.” — Nathaniel Hawthorne",
  "“Your time is limited, so don’t waste it living someone else’s life.” — Steve Jobs",
  "“The bad news is time flies. The good news is you’re the pilot.” — Michael Altshuler",
];

export default function ProfileTimetable() {
  const auth = useMemo(() => getAuth(), []);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [quote, setQuote] = useState(() => encouragementQuotes[0]);
  const [calendarView, setCalendarView] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // ------------------------ UTILITIES ------------------------
  const getRandomQuote = useCallback(
    () => encouragementQuotes[Math.floor(Math.random() * encouragementQuotes.length)],
    []
  );

  const dayNameFromDate = (date) => daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];

  // ------------------------ AUTH ------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) setUser(authUser);
      else { setUser(null); setEvents([]); }
    });
    return unsubscribe;
  }, [auth]);

  // ------------------------ QUOTES ROTATION ------------------------
  useEffect(() => {
    const interval = setInterval(() => setQuote(getRandomQuote()), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getRandomQuote]);

  // ------------------------ FETCH EVENTS ------------------------
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    const unsubscribe = listenToUserEvents(
      user.uid,
      (fetchedEvents) => { setEvents(fetchedEvents || []); setLoading(false); },
      (err) => { console.error(err); setStatusMessage("⚠️ Unable to load events."); setLoading(false); }
    );
    return () => unsubscribe();
  }, [user?.uid]);

  // ------------------------ EVENT HANDLERS ------------------------
  const handleSaveEvent = useCallback(
    async (eventData) => {
      if (!user?.uid) { setStatusMessage("❌ Please log in."); return; }
      setStatusMessage("💾 Saving...");
      try {
        if (eventData.id) await updateUserEvent(user.uid, eventData.id, eventData);
        else await addUserEvent(user.uid, eventData);
        setStatusMessage("✔️ Event saved.");
      } catch (err) {
        console.error(err); setStatusMessage("❌ Save failed.");
      } finally { setTimeout(() => setStatusMessage(""), 2500); }
    },
    [user?.uid]
  );

  const handleDeleteEvent = useCallback(
    async (id) => {
      if (!user?.uid) return;
      setStatusMessage("🗑 Deleting...");
      try { await deleteUserEvent(user.uid, id); setStatusMessage("🗑️ Deleted."); }
      catch (err) { console.error(err); setStatusMessage("❌ Delete failed."); }
      finally { setTimeout(() => setStatusMessage(""), 2500); }
    },
    [user?.uid]
  );

  // ------------------------ COMPONENT: EVENT FORM ------------------------
  const EventForm = ({ existingEvent, onClose }) => {
    const userId = auth.currentUser?.uid;
    const [formData, setFormData] = useState({
      title: existingEvent?.title || "",
      description: existingEvent?.description || "",
      date: existingEvent?.date || "",
      day: existingEvent?.day || "",
      startHour: existingEvent?.startHour || "",
      endHour: existingEvent?.endHour || "",
      location: existingEvent?.location || "",
      onlineLink: existingEvent?.onlineLink || "",
      type: existingEvent?.type || "event",
      recurring: existingEvent?.recurring || false,
    });

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!userId) return alert("User not logged in.");
      if (!formData.title.trim()) return alert("Enter title.");
      if (!formData.date) return alert("Select date.");
      try {
        if (existingEvent?.id) await updateUserEvent(userId, existingEvent.id, formData);
        else await addUserEvent(userId, formData);
        onClose();
      } catch (err) { console.error(err); alert("Failed to save event."); }
    };

    return (
      <form onSubmit={handleSubmit} className="event-form">
        <label>Title:<input type="text" name="title" value={formData.title} onChange={handleChange} required /></label>
        <label>Date:<input type="date" name="date" value={formData.date} onChange={handleChange} required /></label>
        <label>Day:<select name="day" value={formData.day} onChange={handleChange} required>
          <option value="">Select a day</option>
          {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
        </select></label>
        <label>Start Hour:<input type="time" name="startHour" value={formData.startHour} onChange={handleChange} required /></label>
        <label>End Hour:<input type="time" name="endHour" value={formData.endHour} onChange={handleChange} required /></label>
        <label>Location:<input type="text" name="location" value={formData.location} onChange={handleChange} /></label>
        <label>Online Link:<input type="url" name="onlineLink" value={formData.onlineLink} onChange={handleChange} /></label>
        <label>Recurring:<input type="checkbox" name="recurring" checked={formData.recurring} onChange={handleChange} /></label>
        <div className="form-buttons">
          <button type="submit" className="btn-save">{existingEvent?.id ? "Update" : "Add"}</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </form>
    );
  };

  // ------------------------ COMPONENT: TIMETABLE GRID ------------------------
  const TimetableGrid = ({ events = [], onEditEvent, onSaveEvent, value }) => {
    const [dbEvents, setDbEvents] = useState([]);
    const today = value ? new Date(value) : new Date();
    const todayDayName = dayNameFromDate(today);
    const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6am-10pm

    useEffect(() => {
      if (!user?.uid) return;
      const fetchEvents = async () => {
        try {
          const q = query(collection(db, "events"), where("userId", "==", user.uid));
          const snapshot = await getDocs(q);
          setDbEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) { console.error(err); }
      };
      fetchEvents();
    }, [user?.uid, value]);

    const mergedEvents = useMemo(() => {
      const all = [...dbEvents, ...events];
      return all.filter(e => e.userId === user?.uid).map(e => ({
        ...e,
        day: e.day || dayNameFromDate(new Date(e.date)),
        startHour: parseInt(e.startHour, 10),
        endHour: parseInt(e.endHour, 10)
      }));
    }, [dbEvents, events, user?.uid]);

    const eventsMap = useMemo(() => {
      const map = {};
      for (const e of mergedEvents) {
        if (!map[e.day]) map[e.day] = {};
        for (let h = e.startHour; h < e.endHour; h++) map[e.day][h] = e;
      }
      return map;
    }, [mergedEvents]);

    const handleCellClick = (event, day, hour) => {
      if (event) onEditEvent?.(event);
      else {
        const eventDate = new Date(today);
        const clickedDayIndex = daysOfWeek.indexOf(day);
        const currentDayIndex = daysOfWeek.indexOf(todayDayName);
        eventDate.setDate(today.getDate() + (clickedDayIndex - currentDayIndex));
        onSaveEvent?.({
          title: "", type: "", day,
          startHour: hour, endHour: hour + 1,
          location: "", onlineLink: "", notes: "",
          date: eventDate.toISOString().split("T")[0],
          userId: user?.uid
        });
      }
    };

    const findEventInCell = (day, hour) => eventsMap[day]?.[hour] || null;

    return (
      <div className="timetable-grid-container">
        <div className="grid-header-time" />
        {daysOfWeek.map(day => (
          <div key={day} className={`grid-header-day ${day === todayDayName ? "today" : ""}`}>{day}</div>
        ))}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className={`grid-time-label ${hour === today.getHours() ? "current-hour" : ""}`}>{hour}:00</div>
            {daysOfWeek.map(day => {
              const event = findEventInCell(day, hour);
              return (
                <div key={`${day}-${hour}`}
                  className={`grid-cell ${event ? "grid-cell-event" : ""}`}
                  onClick={() => handleCellClick(event, day, hour)}
                  role="button" tabIndex={0}
                  onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleCellClick(event, day, hour)}
                  title={event ? `${event.title} (${event.startHour}:00 - ${event.endHour}:00)` : ""}
                >
                  {event && hour === event.startHour && (
                    <div className="event-card">
                      <div className="event-title">{event.title} {event.type === "Class" ? "📚" : "📅"}</div>
                      {event.location && event.location.toLowerCase() !== "online" && <div className="event-location">{event.location}</div>}
                      {event.location && event.location.toLowerCase() === "online" && event.onlineLink && (
                        <a href={event.onlineLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="event-online-link">Join Online</a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // ------------------------ COMPONENT: CALENDAR VIEW ------------------------
  const CalendarView = ({ events = [], value, onChangeDate }) => {
    const TODAY = new Date();
    const userEvents = useMemo(() => (user ? events.filter(e => e.userId === user.uid) : []), [events, user]);
    const eventsByDay = useMemo(() => {
      const grouped = {};
      for (const ev of userEvents) {
        const dayKey = ev.day?.toLowerCase();
        if (!dayKey) continue;
        if (!grouped[dayKey]) grouped[dayKey] = [];
        grouped[dayKey].push(ev);
      }
      return grouped;
    }, [userEvents]);

    return (
      <div className="calendar-view-container">
        <Calendar
          value={value}
          onChange={onChangeDate}
          tileContent={({ date, view }) => {
            if (view !== "month") return null;
            const dayKey = dayNameFromDate(date).toLowerCase();
            const dayEvents = eventsByDay[dayKey] || [];
            if (!dayEvents.length) return null;
            return (
              <ul className="calendar-day-events-list">
                {dayEvents.map(ev => <li key={ev.id} title={`${ev.title} (${ev.startHour}:00 - ${ev.endHour}:00)`}><span className="dot" />{ev.title}</li>)}
              </ul>
            );
          }}
          tileClassName={({ date, view }) => {
            if (view !== "month") return null;
            const dayKey = dayNameFromDate(date).toLowerCase();
            const hasEvents = eventsByDay[dayKey]?.length > 0;
            const isToday = date.toDateString() === TODAY.toDateString();
            if (isToday) return "calendar-today";
            if (hasEvents) return "calendar-has-events";
            return null;
          }}
        />
      </div>
    );
  };

  // ------------------------ LOADING STATE ------------------------
  if (loading) return (
    <div className="profile-timetable-container"><p className="loading-text">⏳ Loading your timetable...</p></div>
  );

  // ------------------------ MAIN RENDER ------------------------
  return (
    <div className="profile-timetable-container">
      <header className="timetable-header">
        <h3 className="timetable-title">Your Weekly Timetable</h3>
        <p className="quote" aria-live="polite">{quote}</p>
      </header>

      <div className="timetable-controls">
        <button className="btn-add-event" onClick={() => { setEditingEvent(null); setShowForm(true); }}>+ Add Event</button>
        <button className="btn-toggle-view" onClick={() => setCalendarView(v => !v)}>
          {calendarView ? "📅 Show Timetable" : "📆 Show Calendar"}
        </button>
      </div>

      <main className="timetable-main-content">
        {calendarView ? (
          <CalendarView events={events} value={calendarDate} onChangeDate={setCalendarDate} />
        ) : (
          <TimetableGrid events={events} onEditEvent={ev => { setEditingEvent(ev); setShowForm(true); }} onSaveEvent={handleSaveEvent} value={calendarDate} />
        )}
      </main>

      {statusMessage && <div className="timetable-status-message" aria-live="polite">{statusMessage}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <EventForm existingEvent={editingEvent} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
