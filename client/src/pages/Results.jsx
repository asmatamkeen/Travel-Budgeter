import { useLocation, Navigate } from 'react-router-dom'

function Results() {
  const location = useLocation()
  const formData = location.state?.formData

  if (!formData) {
    return <Navigate to="/plan" replace />
  }

  return (
    <div>
      <h1>Trip search (placeholder)</h1>
      <p>
        This page will show real flight/hotel results once the search backend is built.
        For now, here's what the wizard collected:
      </p>
      <ul>
        <li>
          Budget: {formData.totalBudget} {formData.homeCurrency}
        </li>
        <li>Destination: {formData.destination}</li>
        <li>
          Dates: {formData.startDate} to {formData.endDate} ({formData.dateFlexibility})
        </li>
        <li>Travelers: {formData.travelers}</li>
        <li>Flight class: {formData.flightClass}</li>
        <li>Hotel comfort level: {formData.hotelRating}</li>
      </ul>
    </div>
  )
}

export default Results
