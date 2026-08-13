import { useState } from 'react'

function StepPreferences({ formData, updateFormData, onBack, onFinish }) {
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.travelers || Number(formData.travelers) < 1) {
      setError('Enter at least 1 traveler')
      return
    }

    setError('')
    onFinish()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="travelers">Number of travelers</label>
        <input
          id="travelers"
          type="number"
          min="1"
          step="1"
          value={formData.travelers}
          onChange={(e) => updateFormData({ travelers: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="flightClass">Flight class</label>
        <select
          id="flightClass"
          value={formData.flightClass}
          onChange={(e) => updateFormData({ flightClass: e.target.value })}
        >
          <option value="economy">Economy</option>
          <option value="premium_economy">Premium Economy</option>
          <option value="business">Business</option>
        </select>
      </div>
      <div>
        <label htmlFor="hotelRating">Hotel comfort level</label>
        <select
          id="hotelRating"
          value={formData.hotelRating}
          onChange={(e) => updateFormData({ hotelRating: e.target.value })}
        >
          <option value="any">Any</option>
          <option value="budget">Budget</option>
          <option value="3">3-star and up</option>
          <option value="4">4-star and up</option>
        </select>
      </div>
      <div>
        <label htmlFor="dateFlexibility">Dates</label>
        <select
          id="dateFlexibility"
          value={formData.dateFlexibility}
          onChange={(e) => updateFormData({ dateFlexibility: e.target.value })}
        >
          <option value="exact">Exact dates</option>
          <option value="flexible">Flexible (+/- 3 days)</option>
        </select>
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button type="submit">See results</button>
    </form>
  )
}

export default StepPreferences
