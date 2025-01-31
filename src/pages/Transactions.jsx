import { useState, useEffect } from "react"
import api from "../services/api"
import "./Transactions.css"

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    cardId: "",
    type: "",
    category: "",
    subcategory: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  })
  const [cards, setCards] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchTransactions()
    fetchCards()
    fetchCategories()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transaction", { params: filters })
      setTransactions(response.data.transactions)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch transactions. Please try again.")
      setLoading(false)
    }
  }

  const fetchCards = async () => {
    try {
      const response = await api.get("/credit-card/all-cards")
      setCards(response.data)
    } catch (err) {
      console.error("Failed to fetch cards:", err)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get("/user/categories")
      setCategories(response.data)
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchTransactions()
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="transactions">
      <h1>Transactions</h1>
      <form onSubmit={handleSubmit} className="filters-form">
        <select name="cardId" value={filters.cardId} onChange={handleFilterChange}>
          <option value="">All Cards</option>
          {cards.map((card) => (
            <option key={card._id} value={card._id}>
              {card.cardName}
            </option>
          ))}
        </select>
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </select>
        {filters.category && (
          <select name="subcategory" value={filters.subcategory} onChange={handleFilterChange}>
            <option value="">All Subcategories</option>
            {categories
              .find((cat) => cat.category === filters.category)
              ?.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
          </select>
        )}
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          placeholder="Start Date"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          placeholder="End Date"
        />
        <input
          type="number"
          name="minAmount"
          value={filters.minAmount}
          onChange={handleFilterChange}
          placeholder="Min Amount"
        />
        <input
          type="number"
          name="maxAmount"
          value={filters.maxAmount}
          onChange={handleFilterChange}
          placeholder="Max Amount"
        />
        <button type="submit">Apply Filters</button>
      </form>
      <div className="transactions-list">
        {transactions.map((transaction) => (
          <div key={transaction._id} className="transaction-item">
            <p>{transaction.description}</p>
            <p>${transaction.amount.toFixed(2)}</p>
            <p>{transaction.type}</p>
            <p>{transaction.category}</p>
            <p>{transaction.subcategory}</p>
            <p>{new Date(transaction.transactionDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Transactions

