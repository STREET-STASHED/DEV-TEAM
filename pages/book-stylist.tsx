import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const BookStylist = () => {
  const [stylistId, setStylistId] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mock stylist list
  const stylists = [
    { id: "stylist-1", name: "Ashley Styles" },
    { id: "stylist-2", name: "Jamal Cutz" },
    { id: "stylist-3", name: "Tasha Threads" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in to book a stylist.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("bookings").insert([
      {
        stylist_id: stylistId,
        buyer_id: user.id,
        time: bookingTime,
        date: bookingTime,
        notes,
      },
    ]);

    if (!error) {
      setSuccess(true);
      setStylistId("");
      setBookingTime("");
      setNotes("");
    } else {
      alert("Booking failed. Try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Book a Stylist</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium mb-1">Choose Stylist:</label>
          <select
            value={stylistId}
            onChange={(e) => {
              setStylistId(e.target.value);
              setSuccess(false);
              setSubmitting(false);
            }}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select</option>
            {stylists.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Appointment Time:</label>
          <input
            type="datetime-local"
            value={bookingTime}
            onChange={(e) => {
              setBookingTime(e.target.value);
              setSuccess(false);
              setSubmitting(false);
            }}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setSuccess(false);
              setSubmitting(false);
            }}
            rows={4}
            placeholder="Add any preferences or event details"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? "Booking..." : "Book Stylist"}
        </button>
        {success && <p className="text-green-500">Booking submitted!</p>}
      </form>
    </div>
  );
};

export default BookStylist;
