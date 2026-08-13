import { useState } from 'react'

const CURRENCIES = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'INR', label: 'INR - Indian Rupee' },
  { code: 'JPY', label: 'JPY - Japanese Yen' },
  { code: 'AUD', label: 'AUD - Australian Dollar' },
  { code: 'CAD', label: 'CAD - Canadian Dollar' },
  { code: 'SGD', label: 'SGD - Singapore Dollar' },
  { code: 'AED', label: 'AED - UAE Dirham' },
]

function StepBudget({ formData, updateFormData, onNext }) {
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const budget = Number(formData.totalBudget)
    if (!formData.totalBudget || budget <= 0) {
      setError('Enter a budget greater than 0')
      return
    }

    setError('')
    onNext()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="totalBudget">Total budget</label>
        <input
          id="totalBudget"
          type="number"
          min="1"
          step="any"
          value={formData.totalBudget}
          onChange={(e) => updateFormData({ totalBudget: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="homeCurrency">Home currency</label>
        <select
          id="homeCurrency"
          value={formData.homeCurrency}
          onChange={(e) => updateFormData({ homeCurrency: e.target.value })}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Next</button>
    </form>
  )
}

export default StepBudget
