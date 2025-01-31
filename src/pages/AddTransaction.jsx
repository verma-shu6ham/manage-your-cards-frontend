import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../services/api"
import "./AddTransaction.css"

function AddTransaction() {
  const [cardId, setCardId] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState("debit")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [description, setDescription] = useState("")
  const [transactionDate, setTransactionDate] = useState("")
  const [cards, setCards] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchCards()
    fetchCategories()
    const params = new URLSearchParams(location.search)
    const cardIdParam = params.get("cardId")
    if (cardIdParam) {
      setCardId(cardIdParam)
    }
  }, [location])

  const fetchCards = async () => {
    try {
      const response = await api.get("/credit-card/all-cards")
      setCards(response.data)
    } catch (err) {
      setError("Failed to fetch cards. Please try again.")
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get("/user/categories")
      setCategories(response.data)
    } catch (err) {
      setError("Failed to fetch categories. Please try again.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/transaction", {
        cardId,
        amount: Number.parseFloat(amount),
        type,
        category,
        subcategory,
        description,
        transactionDate,
      })
      navigate(`/card/${cardId}`)
    } catch (err) {
      setError("Failed to add transaction. Please try again.")
    }
  }

  return (
    <div className="add-transaction">
      <h1>Add Transaction</h1>
      <form onSubmit={handleSubmit}>
        <select value={cardId} onChange={(e) => setCardId(e.target.value)} required>
          <option value="">Select a card</option>
          {cards.map((card) => (
            <option key={card._id} value={card._id}>
              {card.cardName}
            </option>
          ))}
        </select>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </select>
        {category && (
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
            <option value="">Select a subcategory (optional)</option>
            {categories
              .find((cat) => cat.category === category)
              ?.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
          </select>
        )}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Add Transaction</button>
      </form>
    </div>
  )
}

export default AddTransaction

