import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { updateTransaction, getUserCategories } from '../../services/api';
import { formatDateTime } from '../../utils/mathUtils';
import { useAuth } from "../../contexts/AuthContext/AuthContext.jsx";
import _ from 'lodash';

import './EditTransactionModal.css';

const EditTransactionModal = ({ isOpen, onClose, transaction, onTransactionEdited }) => {
  const { locale } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    transactionDate: '',
    transactionTime: '',
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        subcategory: transaction.subcategory,
        transactionDate: new Date(transaction.transactionDate).toISOString(),
      });

    }
  }, [transaction]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getUserCategories();
        setCategories(fetchedCategories.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    updateSubcategories(transaction.category);
  }, [categories]);

  const updateSubcategories = (category) => {
    const selectedCategory = categories.find(cat => _.kebabCase(cat.category) === _.kebabCase(category));
    setSubcategories(selectedCategory ? selectedCategory.subcategories : []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date') {
      const oldTime = formData.transactionDate.split('T')[1];
      const newDate = new Date(`${value}T${oldTime}`).toISOString()
      setFormData(prev => ({
        ...prev,
        'transactionDate': newDate
      }));
    } else if (name === 'time') {
      const oldDate = formData.transactionDate.split('T')[0];
      const newDate = new Date(`${oldDate}T${value}`).toISOString()
      setFormData(prev => ({
        ...prev,
        'transactionDate': newDate
      }));
    } else if (name === 'category') {
      updateSubcategories(value);
    } else if (name === 'amount') {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTransaction(transaction._id, formData);
      onTransactionEdited();
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="transaction-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Transaction</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className='date-time'>

            <div className="form-group">
              <label htmlFor="date">Transaction Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.transactionDate && formatDateTime(locale, formData.transactionDate, false, false).date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Transaction Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.transactionDate && formatDateTime(locale, formData.transactionDate, false, false).time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >

              {categories.map(cat =>
                (formData.category === _.kebabCase(cat.category) && <option key={cat._id} value={cat.category}>{cat.category}</option>)
              )}
              {categories.map((cat) => (
                formData.category !== _.kebabCase(cat.category) && <option key={cat._id} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="subcategory">Subcategory</label>
            <select
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
            >
              {subcategories.length > 0 ? subcategories.map((subCat, index) =>
                (formData.subcategory === _.kebabCase(subCat) && <option key={index} value={subCat}>{subCat}</option>)
              ) : <option key="no-subcategories" value="" disabled>No subcategories</option>}
              {subcategories.map((subCat, index) =>
                (formData.subcategory !== _.kebabCase(subCat) && <option key={index} value={subCat}>{subCat}</option>)
              )}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditTransactionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transaction: PropTypes.object,
  onTransactionEdited: PropTypes.func.isRequired
};

export default EditTransactionModal; 