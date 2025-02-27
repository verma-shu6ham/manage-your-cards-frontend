import { useState, useEffect } from "react";
import { getAllCards, getUserCategories } from "../../services/api";
import "./TransactionFilterModal.css";

function TransactionFilterModal({ isOpen, onClose, onApplyFilters, currentFilters }) {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    cardIds: currentFilters?.cardIds || [],
    type: currentFilters?.type || "",
    category: currentFilters?.category || "",
    subcategory: currentFilters?.subcategory || "",
    startDate: currentFilters?.startDate || "",
    endDate: currentFilters?.endDate || "",
    minAmount: currentFilters?.minAmount || "",
    maxAmount: currentFilters?.maxAmount || "",
    status: currentFilters?.status || ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCards, fetchedCategories] = await Promise.all([
          getAllCards(),
          getUserCategories()
        ]);
        setCards(fetchedCards);
        setCategories(fetchedCategories.categories);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleCardSelection = (cardId) => {
    setFilters(prev => ({
      ...prev,
      cardIds: prev.cardIds.includes(cardId)
        ? prev.cardIds.filter(id => id !== cardId)
        : [...prev.cardIds, cardId]
    }));
  };

  const handleCategoryChange = (e) => {
    setFilters(prev => ({
      ...prev,
      category: e.target.value,
      subcategory: "" // Reset subcategory when category changes
    }));
  };

  const getSubcategories = () => {
    const selectedCategory = categories.find(cat => cat.category === filters.category);
    return selectedCategory ? selectedCategory.subcategories : [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="filter-modal">
        <div className="modal-header">
          <h2>Filter Transactions</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="filter-section">
            <h3>Select Cards</h3>
            <div className="cards-grid">
              {cards.map(card => (
                <label key={card._id} className="card-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.cardIds.includes(card._id)}
                    onChange={() => handleCardSelection(card._id)}
                  />
                  <span>{card.cardName} (*{card.lastFourDigits})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Transaction Type</h3>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>

          <div className="filter-section">
            <h3>Category</h3>
            <div className="category-inputs">
              <select
                value={filters.category}
                onChange={handleCategoryChange}
                className="category-select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
              </select>

              {filters.category && (
                <select
                  value={filters.subcategory}
                  onChange={(e) => setFilters(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="subcategory-select"
                >
                  <option value="">All Subcategories</option>
                  {getSubcategories().map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="filter-section">
            <h3>Date Range</h3>
            <div className="date-inputs">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                placeholder="Start Date"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                placeholder="End Date"
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Amount Range</h3>
            <div className="amount-inputs">
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                placeholder="Min Amount"
              />
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                placeholder="Max Amount"
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Status</h3>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="reset-button" onClick={() => setFilters({
              cardIds: [],
              type: "",
              category: "",
              subcategory: "",
              startDate: "",
              endDate: "",
              minAmount: "",
              maxAmount: "",
              status: ""
            })}>
              Reset
            </button>
            <button type="submit" className="apply-button">Apply Filters</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionFilterModal; 