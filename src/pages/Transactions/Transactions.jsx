import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import { getTransactions, deleteTransaction } from "../../services/api";
import Loading from "../../components/Loading/Loading";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { formatDateTime } from '../../utils/mathUtils';
import TransactionCharts from "../../components/TransactionCharts/TransactionCharts";
import TransactionFilterModal from "../../components/TransactionFilterModal/TransactionFilterModal";
import TransactionOptionsMenu from "../../components/TransactionOptionsMenu/TransactionOptionsMenu";
import EditTransactionModal from "../../components/EditTransactionModal/EditTransactionModal";
import { formatError } from '../../utils/errorHandler';
import { withErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary'

import "./Transactions.css";

function Transactions() {
  const { user, locale } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({ paymentMethod: "credit_card"});
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchTransactionData(currentFilters);
    }
  }, [user, navigate, currentFilters]);

  const fetchTransactionData = async (filters = {}) => {
    setLoading(true);
    try {
      const fetchedTransactions = await getTransactions(filters);
      setTransactions(fetchedTransactions.transactions);
    } catch (error) {
      const formattedError = formatError(error);
      setError(formattedError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    setCurrentFilters(filters);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(transactionId);
        fetchTransactionData(currentFilters); // Refresh the data
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError.message);
      }
    }
  };

  const handleOptionsClick = (event, transaction) => {
    event.stopPropagation();
    setSelectedTransaction(transaction);
    setShowOptionsMenu(!showOptionsMenu);
  };

  const handleTransactionEdited = () => {
    // Handle the transaction edit
    setIsEditModalOpen(false)
    fetchTransactionData(currentFilters); // Refresh the data
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true); // Open the edit modal
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="transactions-container">
      <main className="transactions-content">
        <div className="transactions-header">
          <h1 className="page-title">Transactions</h1>
          <button
            className="filter-button"
            onClick={() => setIsFilterModalOpen(true)}
            aria-label="Open filter options"
          >
            <FontAwesomeIcon icon={faFilter} />
            <span>Filter</span>
          </button>
        </div>

        <div className="table-container">
          <div className="table-scroll">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>BANK - Card</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const { date, time } = formatDateTime(locale, transaction.transactionDate);
                  return (
                    <tr key={transaction._id}>
                      <td>{`${transaction.card.cardName} - ${transaction.card.lastFourDigits}`}</td>
                      <td className="date-cell">{date}</td>
                      <td className="time-cell">{time}</td>
                      <td className={`transaction-amount ${transaction.type === 'debit' ? 'debit' : 'credit'}`}>
                        {transaction.amount.toFixed(2)}
                      </td>
                      <td className="category-cell">{transaction.category}</td>
                      <td className="subcategory-cell">{transaction.subcategory}</td>
                      <td
                        className="description-cell"
                        title={transaction.description}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          const isTextTruncated = e.currentTarget.scrollWidth > e.currentTarget.clientWidth;
                          if (isTextTruncated) {
                            e.currentTarget.classList.toggle('expanded');
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                      >
                        {transaction.description}
                      </td>
                      <td>
                        <button
                          className="options-button"
                          onClick={(e) => handleOptionsClick(e, transaction)}
                          aria-label="More options"
                        >
                          ...
                        </button>
                        {showOptionsMenu && selectedTransaction === transaction && (
                          <TransactionOptionsMenu
                            onEdit={() => handleEditTransaction(transaction)}
                            onDelete={() => handleDeleteTransaction(transaction._id)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <section className="charts-section">
          <TransactionCharts filters={currentFilters} />
        </section>

        {isFilterModalOpen && <TransactionFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={currentFilters}
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
      </main>
    </div>
  );
}

export default withErrorBoundary(Transactions);
