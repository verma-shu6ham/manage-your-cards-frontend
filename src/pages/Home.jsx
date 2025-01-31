import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import "./Home.css"

function Home() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const response = await api.get("/credit-card/all-cards")
      setCards(response.data)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch cards. Please try again.")
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="home">
      <h1>Your Credit Cards</h1>
      <Link to="/add-card" className="add-card-btn">
        Add New Card
      </Link>
      {cards.length > 0 ? (
        <div className="card-grid">
          {cards.map((card) => (
            <div key={card._id} className="card">
              <h2>{card.cardName}</h2>
              <p>**** **** **** {card.cardNumber.slice(-4)}</p>
              <p>Available Credit: {card.realTimeAvailableCredit.toFixed(2)}</p>
              <p>Outstanding: {card.realTimeOutstanding.toFixed(2)}</p>
              <Link to={`/card/${card._id}`} className="view-details-btn">
                View Details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No cards added yet.</p>
      )}
    </div>
  )
}

export default Home

