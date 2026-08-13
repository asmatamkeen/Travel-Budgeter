import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div>
        <h1>Travel Budgeter</h1>
        <p>Plan trips by what you can afford, not just where you want to go.</p>
        <Link to="/login">Log in</Link> | <Link to="/signup">Sign up</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <p>
        <Link to="/plan">Plan a trip</Link>
      </p>
      <button onClick={logout}>Log out</button>
    </div>
  )
}

export default Home
