import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { addCreditCard } from '../../services/api';
import './AddCardModal.css';
import { formatError } from '../../utils/errorHandler';
import { withErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { trackEvent } from '../../utils/ga.js';

const AddCardModal = ({ isOpen, onClose, onCardAdded }) => {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    creditLimit: '',
    validTill: '',
    lastKnownOutstanding: '0',
    currentStatementDate: '',
    currentPaymentDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cardData = {
        ...formData,
        creditLimit: parseFloat(formData.creditLimit),
        lastKnownOutstanding: parseFloat(formData.lastKnownOutstanding),
      };

      await addCreditCard(cardData);
      onCardAdded();
      onClose();
      trackEvent({
        action: 'add_card',
        category: 'card',
        label: 'Add new card button'
      });
      setFormData({
        cardName: '',
        cardNumber: '',
        creditLimit: '',
        validTill: '',
        lastKnownOutstanding: '0',
        currentStatementDate: '',
        currentPaymentDate: '',
      });
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content add-card-modal">
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faCreditCard} className="modal-icon" />
            Add New Card
          </h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cardName">Card Name</label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              required
              placeholder="Enter card name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              required
              placeholder="Enter card number"
              maxLength="16"
              pattern="\d{16}"
              title="Please enter a valid 16-digit card number"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="creditLimit">Credit Limit</label>
              <input
                type="number"
                id="creditLimit"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter credit limit"
              />
            </div>

            <div className="form-group">
              <label htmlFor="validTill">Valid Till</label>
              <input
                type="month"
                id="validTill"
                name="validTill"
                value={formData.validTill}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="currentStatementDate">Current Statement Date</label>
            <input
              type="date"
              id="currentStatementDate"
              name="currentStatementDate"
              value={formData.currentStatementDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentPaymentDate">Current Payment Date</label>
            <input
              type="date"
              id="currentPaymentDate"
              name="currentPaymentDate"
              value={formData.currentPaymentDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withErrorBoundary(AddCardModal); 