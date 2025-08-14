// src/components/Profile/ProfileTimetable.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  listenToUserEvents,
  deleteUserEvent,
  addUserEvent,
  updateUserEvent,
} from "../../services/db";
import TimetableGrid from "../ProfileTimetable/TimetableGrid";
import EventForm from "../ProfileTimetable/EventForm";
import CalendarView from "../ProfileTimetable/CalendarView";
import "react-calendar/dist/Calendar.css";
import "../../styles/Profile/ProfileTimetable.css";

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [showDayEventList, setShowDayEventList] = useState(false);

  const getRandomQuote = useCallback(
    () => encouragementQuotes[Math.floor(Math.random() * encouragementQuotes.length)],
    []
  );

  const dayNameFromDate = useCallback(
    (date) => daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1],
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) setUser(authUser);
      else {
        setUser(null);
        setEvents([]);
      }
    });
    return unsubscribe;
  }, [auth]);

  useEffect(() => {
    const interval = setInterval(() => setQuote(getRandomQuote()), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getRandomQuote]);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    const unsubscribe = listenToUserEvents(user.uid, (fetchedEvents) => {
      setEvents(fetchedEvents || []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // ✅ Normalize events for both views
  const normalizedEvents = useMemo(() => {
    return events.map((e) => {
      const dateObj =
        e.date instanceof Date
          ? e.date
          : e.date?.toDate
          ? e.date.toDate()
          : new Date(e.date);

      return {
        ...e,
        recurring: e.recurring || false,
        date: dateObj,
        day: e.day || dayNameFromDate(dateObj),
        startHour: parseInt(e.startHour, 10),
        endHour: parseInt(e.endHour, 10),
      };
    });
  }, [events, dayNameFromDate]);

  const handleSaveEvent = useCallback(
    async (eventData) => {
      if (!user?.uid) {
        setStatusMessage("❌ Please log in.");
        return;
      }
      setStatusMessage("💾 Saving...");
      try {
        let updatedEvents;
        if (eventData.id) {
          await updateUserEvent(user.uid, eventData.id, eventData);
          updatedEvents = events.map((ev) =>
            ev.id === eventData.id ? { ...ev, ...eventData } : ev
          );
        } else {
          const newEventId = await addUserEvent(user.uid, eventData);
          updatedEvents = [...events, { ...eventData, id: newEventId }];
        }
        setEvents(Array.from(new Map(updatedEvents.map(ev => [ev.id, ev])).values()));
        setStatusMessage("✔️ Event saved.");
      } catch (err) {
        console.error(err);
        setStatusMessage("❌ Save failed.");
      } finally {
        setTimeout(() => setStatusMessage(""), 2500);
      }
    },
    [events, user?.uid]
  );

  const handleDeleteEvent = useCallback(
    async (id) => {
      if (!user?.uid) return;
      setStatusMessage("🗑 Deleting...");
      try {
        await deleteUserEvent(user.uid, id);
        setEvents(events.filter((ev) => ev.id !== id));
        setStatusMessage("🗑️ Deleted.");
      } catch (err) {
        console.error(err);
        setStatusMessage("❌ Delete failed.");
      } finally {
        setTimeout(() => setStatusMessage(""), 2500);
      }
    },
    [events, user?.uid]
  );

  const handleAddNewEvent = (prefillData = null) => {
    setEditingEvent(prefillData);
    setShowForm(true);
  };

  const handleEditEvent = (eventObj) => {
    setEditingEvent(eventObj);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="profile-timetable-container">
        <p className="loading-text">⏳ Loading your timetable...</p>
      </div>
    );
  }

  return (
    <div className="profile-timetable-container">
      <header className="timetable-header">
        <h3 className="timetable-title">Your Weekly Timetable</h3>
        <p className="quote" aria-live="polite">{quote}</p>
      </header>

      <div className="timetable-controls">
        <button className="btn-add-event" onClick={() => handleAddNewEvent(null)}>
          + Add Event
        </button>
        <button className="btn-toggle-view" onClick={() => setCalendarView(v => !v)}>
          {calendarView ? "📅 Show Timetable" : "📆 Show Calendar"}
        </button>
      </div>

      <main className="timetable-main-content">
        {calendarView ? (
          <CalendarView
            events={normalizedEvents}      // ✅ Normalized first
            value={calendarDate}
            onChangeDate={setCalendarDate}
            user={user}
            dayNameFromDate={dayNameFromDate}
            onDayClick={(date, dayEvents) => {
              if (dayEvents.length > 0) {
                setSelectedDate(date);
                setSelectedDayEvents(dayEvents);
                setShowDayEventList(true);
              } else {
                handleAddNewEvent({ date });
              }
            }}
          />
        ) : (
          <TimetableGrid
            events={normalizedEvents}  // ✅ normalized data
            value={calendarDate}
            dayNameFromDate={dayNameFromDate}
            onEditEvent={handleEditEvent}
            onAddEvent={handleAddNewEvent}
          />
        )}
      </main>

      {statusMessage && (
        <div className="timetable-status-message" aria-live="polite">
          {statusMessage}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <EventForm
              existingEvent={editingEvent}
              user={user}  
              onSave={handleSaveEvent}
              onDelete={handleDeleteEvent}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
