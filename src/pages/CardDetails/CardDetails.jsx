import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getCardDetails, deleteTransaction, getBillingSpending } from "../../services/api.js"
import { formatNumber, formatDateTime } from "../../utils/mathUtils.js"
import Loading from "../../components/Loading/Loading.jsx"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faMoneyBillWave, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'
import AddTransactionModal from "../../components/AddTransactionModal/AddTransactionModal"
import { useAuth } from "../../contexts/AuthContext/AuthContext"
import { TOOLTIP_MESSAGES } from '../../constants/tooltipMessages'
import InfoIcon from '../../components/InfoIcon/InfoIcon'
import UpdateBalanceModal from '../../components/UpdateBalanceModal/UpdateBalanceModal'
import EditTransactionModal from "../../components/EditTransactionModal/EditTransactionModal.jsx"
import { formatError } from '../../utils/errorHandler'
import { withErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary'

import "./CardDetails.css";

function CardDetails() {
  const { id } = useParams()
  const { locale } = useAuth();
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [billingSpending, setBillingSpending] = useState(null);

  useEffect(() => {
    fetchCardDetailsData()
  }, [])

  const fetchBillingSpendingData = async () => {
    try {
      const data = await getBillingSpending({ cardId: id })
      setBillingSpending(data)
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError.message)
    }
  }

  const fetchCardDetailsData = async () => {
    try {
      const data = await getCardDetails(id)
      setCard(data)
      fetchBillingSpendingData();
      setLoading(false)
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError.message)
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(transactionId);
        fetchCardDetailsData();
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError.message);
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleTransactionEdited = () => {
    fetchCardDetailsData();
    setIsEditModalOpen(false);
    setSelectedTransaction(null);
  };

  if (loading) return <Loading />
  if (error) return <div className="error-message">{error}</div>
  if (!card) return <div className="error-message">Card not found</div>

  return (
    <div className="card-details">
      <div className="card-header">
        <h1>{card.cardName}</h1>
        <div className="card-actions">
          <button
            className="add-btn"
            onClick={() => setIsTransactionModalOpen(true)}
          >
            <FontAwesomeIcon icon={faMoneyBillWave} className="icon" />
            Add Transaction
          </button>
          <button
            className="add-btn"
            onClick={() => setIsUpdateModalOpen(true)}
          >
            <FontAwesomeIcon icon={faCreditCard} className="icon" />
            Real-time Available Credit
          </button>
        </div>
      </div>

      <div className="card-info-grid">
        <div className="info-item">
          <label>
            Card Number
            <InfoIcon message={TOOLTIP_MESSAGES.CARD_NUMBER} label="Card Number" />
          </label>
          <p>**** **** **** {card.lastFourDigits}</p>
        </div>
        <div className="info-item">
          <label>
            Credit Limit
            <InfoIcon message={TOOLTIP_MESSAGES.CREDIT_LIMIT} label="Credit Limit" />
          </label>
          <p>{formatNumber(card.creditLimit, locale)}</p>
        </div>
        <div className="info-item">
          <label>
            Available Credit
            <InfoIcon message={TOOLTIP_MESSAGES.AVAILABLE_CREDIT} label="Available Credit" />
          </label>
          <p>{formatNumber(card.lastKnownAvailableCredit, locale)}</p>
        </div>
        <div className="info-item">
          <label>
            Outstanding
            <InfoIcon message={TOOLTIP_MESSAGES.OUTSTANDING} label="Outstanding" />
          </label>
          <p>{formatNumber(card.lastKnownOutstanding, locale)}</p>
        </div>
        <div className="info-item">
          <label>
            Real-time Available Credit
            <InfoIcon message={TOOLTIP_MESSAGES.REAL_TIME_AVAILABLE} label="Real-time Available Credit" />
          </label>
          <p>{formatNumber(card.realTimeAvailableCredit, locale)}</p>
        </div>
        <div className="info-item">
          <label>
            Real-time Outstanding
            <InfoIcon message={TOOLTIP_MESSAGES.REAL_TIME_OUTSTANDING} label="Real-time Outstanding" />
          </label>
          <p>{formatNumber(card.realTimeOutstanding, locale)}</p>
        </div>
        <div className="info-item">
          <label>
            Payment Difference
            <InfoIcon message={TOOLTIP_MESSAGES.PAYMENT_DIFFERENCE} label="Payment Difference" />
          </label>
          <p>{formatNumber(card.paymentDifference, locale)}</p>
        </div>
        <div className="info-item">
          <label>
            Billing Cycle Spending
            <InfoIcon message={`${TOOLTIP_MESSAGES.BILLING_CYCLE_SPENDING} Statement Date: ${formatDateTime(locale, card.currentStatementDate, false, true).date}`} label="Billing Cycle Spending" />
          </label>
          <p>{billingSpending?.monthlyTotal ? formatNumber(billingSpending.monthlyTotal, locale) : formatNumber(0, locale)}</p>
        </div>
      </div>

      <div className="transactions-section">
        <h2>Recent Transactions</h2>
        {card.transactions && card.transactions.length > 0 ? (
          <div className="transactions-grid">
            {card.transactions.map((transaction) => (
              <div key={transaction._id} className="transaction-card">
                <div className="transaction-header">
                  <span className={`type ${transaction.type.toLowerCase()}`}>
                    {transaction.type}
                  </span>
                  <span className="date">
                    {formatDateTime(locale, transaction.transactionDate, false, true).date}
                  </span>
                  <span className="time">
                    {formatDateTime(locale, transaction.transactionDate, false, true).time}
                  </span>
                </div>
                <div className="transaction-body">
                  <p className="description">{transaction.description}</p>
                  <p className="amount">{transaction.amount.toFixed(2)}</p>
                </div>
                <div className="transaction-footer">
                  <div className="transaction-categories">
                    <span className="category">{transaction.category}</span>
                    {transaction.subcategory && (
                      <span className="subcategory">{transaction.subcategory}</span>
                    )}
                  </div>
                  <div className="transaction-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditTransaction(transaction)}
                      aria-label="Edit transaction"
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteTransaction(transaction._id)}
                      aria-label="Delete transaction"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No transactions yet</p>
        )}
      </div>

      {isTransactionModalOpen && <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        preselectedCardId={id}
        onTransactionAdded={fetchCardDetailsData}
      />}


      {isUpdateModalOpen && <UpdateBalanceModal
        cardId={id}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onFetchCardDetailsData={fetchCardDetailsData}
      />}

      {isEditModalOpen && <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onTransactionEdited={handleTransactionEdited}
      />}
    </div>
  )
}

export default withErrorBoundary(CardDetails)
