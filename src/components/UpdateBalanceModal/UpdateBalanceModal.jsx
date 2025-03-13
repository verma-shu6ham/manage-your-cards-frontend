import PropTypes from 'prop-types';
import { useState } from 'react';
import { onlyPositiveValue } from '../../utils/mathUtils';
import { updateRealTimeAvailableCredit } from "../../services/api.js"
import { TOOLTIP_MESSAGES } from '../../constants/tooltipMessages';
import InfoIcon from '../../components/InfoIcon/InfoIcon';
import './UpdateBalanceModal.css';
import { formatError } from '../../utils/errorHandler';
import { withErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

const UpdateBalanceModal = ({ cardId, isOpen, onClose, onFetchCardDetailsData }) => {
  const [realTimeAvailable, setRealTimeAvailable] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!realTimeAvailable) {
      setError("Please enter available credit.");
      return;
    }
    try {
      await handleUpdateBalance(Number(realTimeAvailable));
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError.message);
    }
  };


  const handleUpdateBalance = async () => {
    try {
      await updateRealTimeAvailableCredit(cardId, Number(realTimeAvailable))
      onFetchCardDetailsData()
      setRealTimeAvailable("")
      setError("")
      onClose();
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError.message)
    }
  }


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
            <button type="button" className="button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UpdateBalanceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onFetchCardDetailsData: PropTypes.func.isRequired
};

export default withErrorBoundary(UpdateBalanceModal);