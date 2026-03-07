import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Plus, X } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";

function EventCard({ event, onToggleJoin }) {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/events/${event.id}/join`);
      onToggleJoin(event.id, res.data);
      toast.success(res.data.joined ? "You've joined the event!" : "You've left the event.");
    } catch {
      toast.error("Couldn't update your RSVP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const dateStr = (() => {
    try {
      return new Date(event.event_date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return event.event_date;
    }
  })();

  return (
    <div className="group bg-white rounded-3xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {event.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="font-outfit font-bold text-xl text-stone-900 mb-2">{event.title}</h3>
        <p className="font-manrope text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-stone-500 font-manrope">
            <Calendar className="w-4 h-4 text-orange-400 flex-shrink-0" />
            {dateStr}
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-500 font-manrope">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            {event.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-500 font-manrope">
            <Users className="w-4 h-4 text-stone-400 flex-shrink-0" />
            {event.joined_count} {event.joined_count === 1 ? "person" : "people"} joined
          </div>
        </div>
        <button
          onClick={handleJoin}
          disabled={loading}
          className={`w-full py-2.5 rounded-full font-outfit font-semibold text-sm transition-all duration-200 disabled:opacity-60 ${
            event.joined
              ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
              : "bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-100"
          }`}
        >
          {loading ? "…" : event.joined ? "Leave Event" : "Join Event"}
        </button>
      </div>
    </div>
  );
}

function CreateEventModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    event_date: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.image_url) delete payload.image_url;
      const res = await api.post("/events", payload);
      toast.success("Event created!");
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-outfit font-bold text-2xl text-stone-900 mb-6">Create Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "title", label: "Event Title", placeholder: "Life Drawing Session", type: "text" },
            { name: "location", label: "Location", placeholder: "Studio Room 3, Main Building", type: "text" },
            { name: "event_date", label: "Date & Time", placeholder: "", type: "datetime-local" },
            { name: "image_url", label: "Cover Image URL (optional)", placeholder: "https://…", type: "url" },
          ].map(({ name, label, placeholder, type }) => (
            <div key={name}>
              <label className="block font-outfit font-medium text-sm text-stone-700 mb-1">{label}</label>
              <input
                name={name}
                type={type}
                required={name !== "image_url"}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50 font-manrope text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block font-outfit font-medium text-sm text-stone-700 mb-1">Description</label>
            <textarea
              name="description"
              required
              minLength={10}
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Tell people what this event is about…"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 font-manrope text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-orange-500 text-white font-outfit font-semibold text-sm hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch {
      toast.error("Couldn't load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleToggleJoin = (eventId, data) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, joined: data.joined, joined_count: data.joined_count } : e
      )
    );
  };

  const handleCreated = (event) => setEvents((prev) => [event, ...prev]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-outfit font-extrabold text-4xl text-stone-900 tracking-tight">Events</h1>
          <p className="font-manrope text-stone-500 mt-1">Workshops, exhibitions, and art jams near you.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 text-white font-outfit font-semibold text-sm hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-orange-100"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-stone-100 rounded-3xl h-72 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-outfit font-semibold text-lg">No events yet</p>
          <p className="font-manrope text-sm mt-1">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onToggleJoin={handleToggleJoin} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
