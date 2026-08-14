import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepBudget from '../components/wizard/StepBudget'
import StepTripBasics from '../components/wizard/StepTripBasics'
import StepPreferences from '../components/wizard/StepPreferences'

const STEPS = ['Budget & Currency', 'Trip Basics', 'Preferences']

const initialFormData = {
  totalBudget: '',
  homeCurrency: 'USD',
  origin: '',
  destination: '',
  startDate: '',
  endDate: '',
  travelers: 1,
  flightClass: 'economy',
  hotelRating: 'any',
  dateFlexibility: 'exact',
}

function Wizard() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState(initialFormData)
  const navigate = useNavigate()

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleFinish = () => {
    navigate('/results', { state: { formData } })
  }

  return (
    <div>
      <h1>Plan a trip</h1>
      <p>
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {step === 0 && (
        <StepBudget formData={formData} updateFormData={updateFormData} onNext={goNext} />
      )}
      {step === 1 && (
        <StepTripBasics
          formData={formData}
          updateFormData={updateFormData}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 2 && (
        <StepPreferences
          formData={formData}
          updateFormData={updateFormData}
          onBack={goBack}
          onFinish={handleFinish}
        />
      )}
    </div>
  )
}

export default Wizard
