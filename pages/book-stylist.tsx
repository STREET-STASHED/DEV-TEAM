import { useState } from 'react'
import supabase from '../lib/supabaseClient'

const BookStylist = () => {
  const [stylistId, setStylistId] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Mock stylist list
  const stylists = [
    { id: 'stylist-1', name: 'Ashley Styles' },
    { id: 'stylist-2', name: 'Jamal Cutz' },
    { id: 'stylist-3', name: 'Tasha Threads' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Please log in to book a stylist.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('bookings').insert([
      {
        stylist_id: stylistId,
        buyer_id: user.id,
        time: bookingTime,
        date: bookingTime,
        notes,
      },
    ])

    if (!error) {
      setSuccess(true)
      setStylistId('')
      setBookingTime('')
      setNotes('')
    } else {
      alert('Booking failed. Try again.')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Book a Stylist</h1>
      <form onSubmit={handleSubmit}>
        <label>Choose Stylist:</label>
        <select value={stylistId} onChange={(e) => {
            setStylistId(e.target.value)
            setSuccess(false)
            setSubmitting(false)
          }} required>
          <option value="">Select</option>
          {stylists.map((stylist) => (
            <option key={stylist.id} value={stylist.id}>
              {stylist.name}
            </option>
          ))}
        </select>

        <br /><br />
        <label>Appointment Time:</label>
        <input
          type="datetime-local"
          value={bookingTime}
          onChange={(e) => {
            setBookingTime(e.target.value)
            setSuccess(false)
            setSubmitting(false)
          }}
          required
        />

        <br /><br />
        <label>Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setSuccess(false)
            setSubmitting(false)
          }}
          rows={4}
          placeholder="Add any preferences or event details"
        />

        <br /><br />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Booking...' : 'Book Stylist'}
        </button>
        {success && <p style={{ color: 'green' }}>Booking submitted!</p>}
      </form>
    </div>
  )
}

export default BookStylist
