import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { onlyPositiveValue } from '../../utils/mathUtils';
import { updateRealTimeAvailableCredit } from "../../services/api.js"
import { TOOLTIP_MESSAGES } from '../../constants/tooltipMessages';
import InfoIcon from '../../components/InfoIcon/InfoIcon';
import './UpdateBalanceModal.css';
import { formatError } from '../../utils/errorHandler';
import { withErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { trackEvent } from '../../utils/ga.js';

const UpdateBalanceModal = ({ isOpen, onClose, onFetchCardsData, cards = [], preselectedCardId }) => {
  const [realTimeAvailable, setRealTimeAvailable] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(preselectedCardId || "");


  useEffect(() => {
    if (selectedCardId && cards.length > 0) {
      const selectedCard = cards.find(card => card._id === selectedCardId);
      if (selectedCard) {
        setRealTimeAvailable(selectedCard.realTimeAvailableCredit);
      }
    }
  }, [selectedCardId, cards]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    try {
      if (!selectedCardId) {
        throw new Error("Please select a card.");
      }
      if (!realTimeAvailable) {
        throw new Error("Please enter available credit.");
      }
      await updateRealTimeAvailableCredit(selectedCardId, Number(realTimeAvailable));
      onFetchCardsData();
      trackEvent({
        action: 'update_real_time_available',
        category: 'card',
        label: 'Update real-time available credit',
        value: Number.parseFloat(realTimeAvailable)
      });
      setRealTimeAvailable("");
      setError("");
      onClose();
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError.message);
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="update-balance-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Real-time Available Credit</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="update-balance-form">
          {preselectedCardId ? (
            <div className="form-group">
              <label htmlFor="card-selection">Select Card</label>
              <input
                id="paymentMethod"
                type="text"
                value={cards.find(card => card._id === preselectedCardId)?.cardName || 'Loading...'}
                disabled
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="card-selection">Select Card</label>
              <select
                id="card-selection"
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                required
              >
                <option value="">Select a card</option>
                {cards.map((card) => (
                  <option key={card._id} value={card._id}>
                    {card.cardName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="available-credit">Available Credit
              <InfoIcon message={TOOLTIP_MESSAGES.REAL_TIME_AVAILABLE} label="Real-time Available Credit" />
            </label>
            <input
              id="available-credit"
              type="number"
              value={realTimeAvailable}
              onChange={(e) => onlyPositiveValue(e.target.value, setRealTimeAvailable)}
              placeholder="Enter available credit"
              required
              inputMode="decimal"
              onFocus={(e) => e.target.select()}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

UpdateBalanceModal.propTypes = {
  preselectedCardId: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onFetchCardsData: PropTypes.func.isRequired,
  cards: PropTypes.array
};

export default withErrorBoundary(UpdateBalanceModal);