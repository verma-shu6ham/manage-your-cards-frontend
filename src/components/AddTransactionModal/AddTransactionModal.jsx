import { useState, useEffect } from "react";
import { getAllCards, getUserCategories, createTransaction, createCashTransaction } from "../../services/api.js";
import { onlyPositiveValue } from "../../utils/mathUtils.js";
import { formatDateTime } from '../../utils/mathUtils';
import { useAuth } from "../../contexts/AuthContext/AuthContext.jsx";

import "./AddTransactionModal.css";

const AddTransactionModal = ({ isOpen, onClose, preselectedCardId, onTransactionAdded }) => {
    const { locale } = useAuth();
    const [cardId, setCardId] = useState(preselectedCardId || "");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("debit");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [description, setDescription] = useState("");
    const [transactionDate, setTransactionDate] = useState("");
    const [cards, setCards] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [transactionDateOnly, setTransactionDateOnly] = useState(new Date().toISOString().split('T')[0]);
    const [transactionTime, setTransactionTime] = useState(new Date().toISOString().split('T')[1]);
    const [isCash, setIsCash] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("")

    useEffect(() => {
        if (isOpen) {
            fetchCards();
            fetchCategories();
            setCardId(preselectedCardId || "");
            setTransactionDate(new Date().toISOString());
        }
    }, [isOpen, preselectedCardId]);

    const fetchCards = async () => {
        try {
            const data = await getAllCards();
            setCards(data);
        } catch (err) {
            setError("Failed to fetch cards. Please try again.");
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getUserCategories();
            setCategories(data.categories);
        } catch (err) {
            setError("Failed to fetch categories. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!isCash && !cardId) || !amount || !category || !transactionDate) {
            setError("Please fill in all required fields.");
            return;
        }
        try {
            if (!isCash) {
                await createTransaction({
                    cardId,
                    amount: Number.parseFloat(amount),
                    type,
                    category,
                    subcategory,
                    description,
                    transactionDate,
                });
            } else {
                await createCashTransaction({
                    amount: Number.parseFloat(amount),
                    category,
                    subcategory,
                    description,
                    transactionDate,
                })
            }

            onTransactionAdded?.();
            resetForm();
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };
    const handlePaymentMethod = (e) => {
        const method = e.target.value;
        if (method === 'cash') {
            setIsCash(true)
            setPaymentMethod('cash')
        } else {
            setCardId(method)
            setPaymentMethod(method)
            setIsCash(false)
        }
    }

    useEffect(() => {
        if (isCash) {
            setCategory("Monthly Expense")
        } else {
            setCategory("")
        }
    }, [isCash])

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setTransactionDateOnly(newDate);
        setTransactionDate(new Date(`${newDate}T${transactionTime}`).toISOString());
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTransactionTime(newTime);
        setTransactionDate(new Date(`${transactionDateOnly}T${newTime}`).toISOString());
    };

    const resetForm = () => {
        setAmount("");
        setType("debit");
        setCategory("");
        setSubcategory("");
        setDescription("");
        setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="transaction-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Transaction</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="add-transaction-form">
                    <div className="form-group">
                        <label htmlFor="paymentMethod">Payment Method</label>
                        {preselectedCardId ? (
                            <input
                                id="paymentMethod"
                                type="text"
                                value={cards.find(card => card._id === preselectedCardId)?.cardName || 'Loading...'}
                                disabled
                            />
                        ) : (
                            <select
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={handlePaymentMethod}
                                required
                            >
                                <option value="">Select a payment method</option>
                                <option value="cash">Cash</option>
                                {cards.map((card) => (
                                    <option key={card._id} value={card._id}>
                                        {card.cardName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Amount</label>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => onlyPositiveValue(e.target.value, setAmount)}
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required={!isCash}
                            disabled={isCash}
                        >
                            <option value="debit">Debit</option>
                            <option value="credit">Credit</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required={!isCash}
                            disabled={isCash}
                        >
                            {isCash ? <option value="Monthly Expense">Monthly Expense</option> : <option value="">Select a category</option>}
                            {categories.map((cat) => (
                                <option key={cat.category} value={cat.category}>
                                    {cat.category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {category && (
                        <div className="form-group">
                            <label htmlFor="subcategory">Subcategory</label>
                            <select
                                id="subcategory"
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                            >
                                <option value="">Select a subcategory (optional)</option>
                                {categories
                                    .find((cat) => cat.category === category)
                                    ?.subcategories.map((sub) => (
                                        <option key={sub} value={sub}>
                                            {sub}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    <div className="date-time">
                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input
                                id="date"
                                type="date"
                                value={transactionDate && formatDateTime(locale, transactionDate, false, false).date}
                                onChange={handleDateChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="time">Time</label>
                            <input
                                id="time"
                                type="time"
                                value={transactionDate && formatDateTime(locale, transactionDate, false, false).time}
                                onChange={handleTimeChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <input
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description"
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="modal-footer">
                        <button type="button" className="reset-button" onClick={resetForm}>
                            Reset
                        </button>
                        <button type="submit" className="apply-button">
                            Add Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal; 