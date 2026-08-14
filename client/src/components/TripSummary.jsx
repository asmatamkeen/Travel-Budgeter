import BudgetChart from './BudgetChart'

function TripSummary({ origin, destination, nights, currency, flights, hotels, breakdown }) {
  return (
    <div>
      <h1>Trip to {destination}</h1>
      <p>
        {origin && <>From {origin} &middot; </>}
        {nights} night{nights === 1 ? '' : 's'} &middot; budget {breakdown.totalBudget} {currency}
      </p>

      <section>
        <h2>Budget breakdown</h2>
        <BudgetChart breakdown={breakdown} currency={currency} />
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

export default TripSummary
