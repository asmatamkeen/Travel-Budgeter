import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trips, setTrips] = useState([])

  useEffect(() => {
    let cancelled = false

    const fetchTrips = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await apiClient.get('/trips')
        if (!cancelled) setTrips(response.data)
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load your saved trips.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTrips()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1>My trips</h1>
      <p>
        <Link to="/plan">Plan a new trip</Link>
      </p>

      {loading && <p>Loading your saved trips...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && trips.length === 0 && (
        <p>You haven't saved any trips yet.</p>
      )}

      {!loading && !error && trips.length > 0 && (
        <ul>
          {trips.map((trip) => (
            <li key={trip._id}>
              <Link to={`/trips/${trip._id}`}>
                {trip.destination} &middot; {trip.startDate} to {trip.endDate} &middot;{' '}
                {trip.breakdown.totalBudget} {trip.homeCurrency}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dashboard
