import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../api/client'
import TripSummary from '../components/TripSummary'

function TripDetail() {
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trip, setTrip] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchTrip = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await apiClient.get(`/trips/${id}`)
        if (!cancelled) setTrip(response.data)
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load this trip.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTrip()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <p>Loading trip...</p>
  }

  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
        <Link to="/dashboard">Back to my trips</Link>
      </div>
    )
  }

  return (
    <div>
      <p>
        <Link to="/dashboard">Back to my trips</Link>
      </p>
      <TripSummary
        destination={trip.destination}
        nights={trip.nights}
        currency={trip.homeCurrency}
        flights={trip.flights}
        hotels={trip.hotels}
        breakdown={trip.breakdown}
      />
    </div>
  )
}

export default TripDetail
