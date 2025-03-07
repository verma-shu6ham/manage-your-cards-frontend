import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { getAllCards } from "../../services/api"
import Loading from "../../components/Loading/Loading"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faPlusCircle, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons'
import { formatNumber } from "../../utils/mathUtils"
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import AddTransactionModal from "../../components/AddTransactionModal/AddTransactionModal";
import AddCardModal from "../../components/AddCardModal/AddCardModal";
import { TOOLTIP_MESSAGES } from '../../constants/tooltipMessages';
import InfoIcon from '../../components/InfoIcon/InfoIcon';

import "./Home.css"

function Home() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortBy, setSortBy] = useState("cardName")
  const [sortOrder, setSortOrder] = useState("asc")
  const [showActive, setShowActive] = useState(true)
  const [showInactive, setShowInactive] = useState(true)
  const { locale } = useAuth();
  const navigate = useNavigate()
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    setLoading(true)
    try {
      const data = await getAllCards()
      setCards(data)
    } catch (err) {
      setError("Failed to fetch cards. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const sortedAndFilteredCards = useMemo(() => {
    return cards
      .filter(card => {
        const cardStatus = card.status || "active"
        return (showActive && cardStatus === "active") ||
          (showInactive && cardStatus === "inactive")
      })
      .sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        return sortOrder === "asc"
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1
      })
  }, [cards, sortBy, sortOrder, showActive, showInactive])

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc")
  }

  const handleCardClick = (cardId) => {
    navigate(`/card/${cardId}`)
  }

  if (loading) return <Loading />
  if (error) return <div className="error-message">{error}</div>

  const totalCreditLimit = cards.reduce((sum, card) => sum + (card.creditLimit || 0), 0)
  const totalOutstanding = cards.reduce((sum, card) => sum + (card.lastKnownOutstanding || 0), 0)

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button
          className="add-btn"
          onClick={() => setIsAddCardModalOpen(true)}
        >
          <FontAwesomeIcon icon={faPlusCircle} className="icon" />
          Add New Card
        </button>
        <button
          className="add-btn"
          onClick={() => setIsTransactionModalOpen(true)}
        >
          <FontAwesomeIcon icon={faMoneyBillWave} className="icon" />
          Add Transaction
        </button>
      </header>

      <div className="quick-stats-banner">
        <div className="stats-content">
          <div className="stat-item">
            <label>Total Credit Limit
              <InfoIcon message={TOOLTIP_MESSAGES.TOTAL_CREDIT_LIMIT} label="Total Credit Limit" />
            </label>
            <p className="amount">{formatNumber(totalCreditLimit, locale)}</p>
          </div>
          <div className="stat-item">
            <label>Total Available Credit
              <InfoIcon message={TOOLTIP_MESSAGES.TOTAL_AVAILABLE_CREDIT} label="Total Credit Limit" />
            </label>
            <p className="amount">{formatNumber(totalCreditLimit - totalOutstanding, locale)}</p>
          </div>
          <div className="stat-item">
            <label>Total Outstanding
              <InfoIcon message={TOOLTIP_MESSAGES.TOTAL_OUTSTANDING} label="Total Credit Limit" />
            </label>
            <p className="amount">{formatNumber(totalOutstanding, locale)}</p>
          </div>
          <div className="stat-item">
            <label>Total Cards
              <InfoIcon message={TOOLTIP_MESSAGES.TOTAL_CARDS} label="Total Credit Limit" />
            </label>
            <p className="amount">{cards?.length?.toLocaleString()}</p>
          </div>
        </div>
      </div>


      <div className="home-cards-section">
        <div className="section-header">
          <h2>Your Cards</h2>
          <div className="controls">
            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="cardName">Name</option>
                <option value="creditLimit">Credit Limit</option>
                <option value="lastKnownAvailableCredit">Available Credit</option>
                <option value="lastKnownOutstanding">Outstanding</option>
                <option value="paymentDifference">Payment Difference</option>
              </select>
              <button onClick={toggleSortOrder} className="sort-order-btn">
                <FontAwesomeIcon icon={sortOrder === "asc" ? faArrowUp : faArrowDown} />
              </button>
            </div>
            <div className="toggle-controls">
              <label className="toggle">
                <span>Active</span>
                <input
                  type="checkbox"
                  checked={showActive}
                  onChange={(e) => setShowActive(e.target.checked)}
                />
              </label>
              <label className="toggle">
                <span>Inactive</span>
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="home-cards-grid">
          {sortedAndFilteredCards.length > 0 ? (
            sortedAndFilteredCards.map((card) => (
              <div
                key={card._id}
                className="home-card"
                onClick={() => handleCardClick(card._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(card._id)
                  }
                }}
              >
                <div className="home-card-header">
                  <h2>{card.cardName}</h2>
                  <span className={`status-badge ${card.status || 'active'}`}>
                    {card.status || 'Active'}
                  </span>
                </div>
                <p className="home-card-number">**** **** **** {card.lastFourDigits}</p>
                <div className="home-card-details">
                  <div className="home-detail-row">
                    <span className="home-detail-label">Credit Limit:

                    </span>
                    <span className="home-detail-value">{formatNumber(card.creditLimit, locale)}</span>
                  </div>
                  <div className="home-detail-row">
                    <span className="home-detail-label">Available Credit:
                    </span>
                    <span className="detail-value">{formatNumber(card.lastKnownAvailableCredit, locale)}</span>
                  </div>
                  <div className="home-detail-row">
                    <span className="home-detail-label">Outstanding:

                    </span>
                    <span className="home-detail-value">{formatNumber(card.lastKnownOutstanding, locale)}</span>
                  </div>
                  <div className="home-detail-row">
                    <span className="home-detail-label">Payment Difference:</span>
                    <span className={`home-detail-value ${card.paymentDifference <= 0 ? 'negative' : 'positive'
                      }`}>
                      {formatNumber(card.paymentDifference < 0 ? card.paymentDifference * -1 : card.paymentDifference, locale)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-cards">No cards found with current filters.</p>
          )}
        </div>
      </div>

      {isAddCardModalOpen && <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onCardAdded={fetchCards}
      />}
      
      {isTransactionModalOpen  && <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onTransactionAdded={fetchCards}
      />}
    </div>
  )
}

export default Home

