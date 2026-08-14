import { useState } from 'react'

function StepTripBasics({ formData, updateFormData, onNext, onBack }) {
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.origin.trim()) {
      setError('Enter where you are departing from')
      return
    }

    if (!formData.destination.trim()) {
      setError('Enter a destination')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    if (formData.startDate < today) {
      setError('Start date cannot be in the past')
      return
    }

    if (formData.endDate <= formData.startDate) {
      setError('End date must be after the start date')
      return
    }

    setError('')
    onNext()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="origin">Departing from</label>
        <input
          id="origin"
          type="text"
          placeholder="e.g. London"
          value={formData.origin}
          onChange={(e) => updateFormData({ origin: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="destination">Destination</label>
        <input
          id="destination"
          type="text"
          placeholder="e.g. Bali, Indonesia"
          value={formData.destination}
          onChange={(e) => updateFormData({ destination: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="startDate">Start date</label>
        <input
          id="startDate"
          type="date"
          value={formData.startDate}
          onChange={(e) => updateFormData({ startDate: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="endDate">End date</label>
        <input
          id="endDate"
          type="date"
          value={formData.endDate}
          onChange={(e) => updateFormData({ endDate: e.target.value })}
          required
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button type="submit">Next</button>
    </form>
  )
}

export default StepTripBasics
