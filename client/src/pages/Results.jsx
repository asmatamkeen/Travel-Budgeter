import { useState, useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import apiClient from '../api/client'

function Results() {
  const location = useLocation()
  const formData = location.state?.formData

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)

  useEffect(() => {
    if (!formData) return

    let cancelled = false

    const runSearch = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await apiClient.post('/search', formData)
        if (!cancelled) setResults(response.data)
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Search failed. Please try again.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    runSearch()

    return () => {
      cancelled = true
    }
  }, [formData])

  if (!formData) {
    return <Navigate to="/plan" replace />
  }

  if (loading) {
    return (
      <div>
        <h1>Searching...</h1>
        <p>
          Looking for flights and hotels in {formData.destination} within your budget.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1>Something went wrong</h1>
        <p role="alert">{error}</p>
      </div>
    )
  }

  const { nights, currency, flights, hotels, breakdown } = results

  return (
    <div>
      <h1>Trip to {results.destination}</h1>
      <p>
        {nights} night{nights === 1 ? '' : 's'} &middot; budget {breakdown.totalBudget} {currency}
      </p>

      <section>
        <h2>Budget breakdown</h2>
        <ul>
          <li>
            Flight: {breakdown.flightCost} {currency}
          </li>
          <li>
            Hotel: {breakdown.hotelCost} {currency}
          </li>
          <li>
            Leftover: {breakdown.leftover} {currency}
            {breakdown.leftover < 0 && ' (over budget)'}
          </li>
        </ul>
      </section>

      <section>
        <h2>Flights</h2>
        {flights.length === 0 && <p>No flights found.</p>}
        <ul>
          {flights.map((f) => (
            <li key={f.flightNumber}>
              {f.airline} {f.flightNumber} &middot; {f.cabinClass} &middot;{' '}
              {f.stops === 0 ? 'nonstop' : `${f.stops} stop(s)`} &middot;{' '}
              {f.totalPrice} {currency}
              {!f.withinBudget && ' (over budget)'}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Hotels</h2>
        {hotels.length === 0 && <p>No hotels found.</p>}
        <ul>
          {hotels.map((h) => (
            <li key={h.name}>
              {h.name} &middot; {h.starRating}-star &middot; {h.totalPrice} {currency} total
              {!h.withinBudget && ' (over budget)'}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default Results
