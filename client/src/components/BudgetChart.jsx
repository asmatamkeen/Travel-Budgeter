function Segment({ label, amount, currency, colorVar }) {
  const pct = amount.pct

  return (
    <div
      className="budget-chart-segment"
      style={{ width: `${pct}%`, background: `var(${colorVar})` }}
    >
      {pct >= 15 && (
        <span className="budget-chart-segment-label">
          {amount.value} {currency}
        </span>
      )}
    </div>
  )
}

function Legend({ items, currency }) {
  return (
    <ul className="budget-chart-legend">
      {items.map((item) => (
        <li key={item.label}>
          <span className="budget-chart-swatch" style={{ background: `var(${item.colorVar})` }} />
          {item.label}: {item.value} {currency}
        </li>
      ))}
    </ul>
  )
}

function BudgetChart({ breakdown, currency }) {
  const { totalBudget, flightCost, hotelCost, leftover } = breakdown
  const isOverBudget = leftover < 0

  if (!isOverBudget) {
    const items = [
      { label: 'Flight', value: flightCost, colorVar: '--chart-series-1' },
      { label: 'Hotel', value: hotelCost, colorVar: '--chart-series-2' },
      { label: 'Leftover', value: leftover, colorVar: '--chart-series-3' },
    ]

    return (
      <div className="budget-chart">
        <div className="budget-chart-bar">
          {items.map((item) => (
            <Segment
              key={item.label}
              label={item.label}
              currency={currency}
              colorVar={item.colorVar}
              amount={{
                value: item.value,
                pct: totalBudget > 0 ? (item.value / totalBudget) * 100 : 0,
              }}
            />
          ))}
        </div>
        <Legend items={items} currency={currency} />
      </div>
    )
  }

  // Flight + hotel together exceed the budget, so a normal part-to-whole
  // stack (parts summing to the budget) doesn't apply. Instead: flight and
  // hotel shown as a share of their own combined total, with a marker for
  // where the budget line actually falls, and an explicit callout for the
  // overage - status color, always paired with an icon and text label.
  const spend = flightCost + hotelCost
  const budgetLinePct = spend > 0 ? Math.min(100, (totalBudget / spend) * 100) : 0
  const items = [
    { label: 'Flight', value: flightCost, colorVar: '--chart-series-1' },
    { label: 'Hotel', value: hotelCost, colorVar: '--chart-series-2' },
  ]

  return (
    <div className="budget-chart">
      <div className="budget-chart-bar-wrap">
        <div className="budget-chart-bar">
          {items.map((item) => (
            <Segment
              key={item.label}
              label={item.label}
              currency={currency}
              colorVar={item.colorVar}
              amount={{
                value: item.value,
                pct: spend > 0 ? (item.value / spend) * 100 : 0,
              }}
            />
          ))}
        </div>
        <div
          className="budget-chart-budget-line"
          style={{ left: `${budgetLinePct}%` }}
          title={`Your budget: ${totalBudget} ${currency}`}
        >
          <span className="budget-chart-budget-line-label">Budget</span>
        </div>
      </div>
      <Legend items={items} currency={currency} />
      <p className="budget-chart-callout">
        <span aria-hidden="true">⚠</span> Over budget by {Math.abs(leftover)} {currency}
      </p>
    </div>
  )
}

export default BudgetChart
