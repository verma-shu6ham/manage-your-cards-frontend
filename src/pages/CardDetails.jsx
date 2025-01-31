import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import "./CardDetails.css"
import { fetchCardDetails, updateRealTimeAvailableCredit } from "../services/api"

function CardDetails() {
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { id } = useParams()

  useEffect(() => {
    fetchCardDetailsData()
  }, [])

  const fetchCardDetailsData = async () => {
    try {
      const data = await fetchCardDetails(id)
      setCard(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleUpdateBalance = async (e) => {
    e.preventDefault()
    const realTimeAvailable = e.target.realTimeAvailable.value
    try {
      await updateRealTimeAvailableCredit(id, realTimeAvailable)
      fetchCardDetailsData()
      e.target.realTimeAvailable.value = ""
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!card) return <div>Card not found</div>

  return (
    <div className="card-details">
      <h1>{card.cardName}</h1>
      <p>Card Number: **** **** **** {card.cardNumber.slice(-4)}</p>
      <p>Credit Limit: ₹{card.creditLimit.toFixed(2)}</p>
      <p>Last Known Available Credit: ₹{card.lastKnownAvailableCredit.toFixed(2)}</p>
      <p>Last Known Outstanding: ₹{card.lastKnownOutstanding.toFixed(2)}</p>
      <p>Real Time Available Credit: ₹{card.realTimeAvailableCredit.toFixed(2)}</p>
      <p>Real Time Outstanding: ₹{card.realTimeOutstanding.toFixed(2)}</p>
      <p>Payment Difference: ₹{card.paymentDifference.toFixed(2)}</p>

      <h2>Update Real-Time Available Credit</h2>
      <form onSubmit={handleUpdateBalance}>
        <input type="number" name="realTimeAvailable" placeholder="Real-Time Available Credit" required />
        <button type="submit">Update</button>
      </form>

      <Link to={`/add-transaction?cardId=${id}`} className="add-transaction-btn">
        Add Transaction
      </Link>

      <h2>Recent Transactions</h2>
      {card.transactions && card.transactions.length > 0 ? (
        <ul className="transactions-list">
          {card.transactions.map((transaction) => (
            <li key={transaction._id}>
              <span>{transaction.description}</span>
              <span>₹{transaction.amount.toFixed(2)}</span>
              <span>{transaction.type}</span>
              <span>{new Date(transaction.transactionDate).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions yet</p>
      )}
    </div>
  )
}

export default CardDetails

