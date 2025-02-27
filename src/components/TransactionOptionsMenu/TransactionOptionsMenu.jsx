import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import './TransactionOptionsMenu.css';

const TransactionOptionsMenu = ({ onEdit, onDelete }) => {
  return (
    <div className="options-menu">
      <button className="action-btn edit" onClick={onEdit} aria-label="Edit transaction">
        <FontAwesomeIcon icon={faPencil} /> Edit
      </button>
      <button className="action-btn delete" onClick={onDelete} aria-label="Delete transaction">
        <FontAwesomeIcon icon={faTrash} /> Delete
      </button>
    </div>
  );
};

export default TransactionOptionsMenu; 