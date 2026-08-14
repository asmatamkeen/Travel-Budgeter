import { useState, useEffect } from 'react'
import { useLocation, Navigate, Link } from 'react-router-dom'
import apiClient from '../api/client'
import TripSummary from '../components/TripSummary'

function Results() {
  const location = useLocation()
  const formData = location.state?.formData

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveError, setSaveError] = useState('')

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

  const handleSave = async () => {
    setSaveStatus('saving')
    setSaveError('')

    try {
      await apiClient.post('/trips', {
        origin: results.origin,
        destination: results.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        nights: results.nights,
        travelers: formData.travelers,
        homeCurrency: results.currency,
        flightClass: formData.flightClass,
        hotelRating: formData.hotelRating,
        dateFlexibility: formData.dateFlexibility,
        flights: results.flights,
        hotels: results.hotels,
        breakdown: results.breakdown,
      })
      setSaveStatus('saved')
    } catch (err) {
      setSaveStatus('error')
      setSaveError(err.response?.data?.error || 'Failed to save trip. Please try again.')
    }
  }

  return (
    <div>
      <p>
        <Link to="/plan">Plan another trip</Link> | <Link to="/dashboard">My trips</Link>
      </p>

      <button onClick={handleSave} disabled={saveStatus === 'saving' || saveStatus === 'saved'}>
        {saveStatus === 'saved' ? 'Trip saved' : saveStatus === 'saving' ? 'Saving...' : 'Save this trip'}
      </button>
      {saveStatus === 'error' && <p role="alert">{saveError}</p>}

      {results.dataSource === 'mock' && (
        <p>
          Showing simulated flight and hotel data — live search is temporarily unavailable
          (API limit reached or a booking site didn't respond). Try again later for real
          results.
        </p>
      )}

      <TripSummary
        origin={results.origin}
        destination={results.destination}
        nights={results.nights}
        currency={results.currency}
        flights={results.flights}
        hotels={results.hotels}
        breakdown={results.breakdown}
      />
    </div>
  )
}

export default Results
