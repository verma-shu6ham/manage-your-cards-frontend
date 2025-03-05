import { useState, useEffect } from "react"
import { addCategory, deleteCategory, getUserCategories, getProfile, updateLocale, getAllCards, deleteCard, deleteAccount } from "../../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faUser, faTrash, faCog, faListUl, faInfoCircle, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import Loading from "../../components/Loading/Loading"
import { useAuth } from "../../contexts/AuthContext/AuthContext"
import { useNavigate } from "react-router-dom"
import { localeCurrencyMap } from "../../constants/localeAndSymbol"

import "./Profile.css"

function Profile() {
  const { logout, locale, setLocale } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("personal")
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState("")
  const [newSubcategory, setNewSubcategory] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(true)
  const [subSectionLoading, setSubSectionLoading] = useState(true)
  const [error, setError] = useState("")
  const [profileData, setProfileData] = useState(null)
  const [cards, setCards] = useState([])

  const handleCurrencyChange = async(newLocale) => {
    try {
      const data = await updateLocale(newLocale)
      setLocale(data.locale)
      setLoading(false)
    } catch (err) {
      setError("Failed to update country")
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getProfile()
        setProfileData(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch profile data")
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategories()
    } else if (activeTab === 'deleteCard') {
      fetchCards()
    }
  }, [activeTab])

  const fetchCategories = async () => {
    try {
      const data = await getUserCategories()
      setCategories(data.categories)
      setSubSectionLoading(false)
    } catch (err) {
      setError("Failed to fetch categories. Please try again.")
      setSubSectionLoading(false)
    }
  }

  const fetchCards = async () => {
    try {
      const data = await getAllCards()
      setCards(data)
      setSubSectionLoading(false)
    } catch (err) {
      setError("Failed to fetch cards. Please try again.")
    } finally {
      setSubSectionLoading(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory) return
    try {
      await addCategory({ category: newCategory })
      await fetchCategories()
      setNewCategory("")
    } catch (err) {
      setError("Failed to add category. Please try again.")
    }
  }

  const handleAddSubcategory = async (e) => {
    e.preventDefault()
    if (!selectedCategory || !newSubcategory) return

    try {
      await addCategory({
        category: selectedCategory,
        subcategory: newSubcategory
      })
      await fetchCategories()
      setNewSubcategory("")
      setSelectedCategory("")
    } catch (err) {
      setError("Failed to add subcategory. Please try again.")
    }
  }

  const handleRemoveCategory = async (categoryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?")
    if (confirmDelete) {
      try {
        await deleteCategory({ categoryId })
        await fetchCategories()
      } catch (err) {
        setError("Failed to remove category. Please try again.")
      }
    }
  }

  const handleRemoveSubcategory = async (categoryId, subcategory) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this subcategory?")
    if (confirmDelete) {
      try {
        await deleteCategory({
          categoryId,
          subcategory
        })
        await fetchCategories()
      } catch (err) {
        setError("Failed to remove subcategory. Please try again.")
      }
    }
  }

  const handleDeleteCard = async (cardId) => {
    const confirmDelete = window.confirm("Are you certain? Deleting your card will permanently remove it along with all associated transactions, which will affect the transaction records, monthly data and charts. This action cannot be undone.")
    if (confirmDelete) {
      try {
        await deleteCard(cardId)
        fetchCards()
      } catch (err) {
        setError("Failed to delete card. Please try again.")
      }
    }
  }

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you absolutely sure? This will permanently delete your account and all associated data.")
    if (confirmDelete) {
      try {
        await deleteAccount()
        logout()
        navigate("/login")
      } catch (err) {
        setError("Failed to delete account. Please try again.")
      }
    }
  }

  const renderPersonalInfo = () => (
    <div className="tab-content">
      <h2>Personal Information</h2>
      {profileData && (
        <>
          <div className="info-group">
            <label>Name</label>
            <p>{profileData.name}</p>
          </div>
          <div className="info-group">
            <label>Email</label>
            <p>{profileData.email}</p>
          </div>
          <div className="info-group">
            <label>Member Since</label>
            <p>{new Date(profileData.createdAt).toLocaleDateString()}</p>
          </div>
          {profileData.phone && (
            <div className="info-group">
              <label>Phone</label>
              <p>{profileData.phone}</p>
            </div>
          )}
        </>
      )}
    </div>
  )

  const renderSettings = () => (
    <div className="tab-content">
      <h2>Settings</h2>
      <div className="settings-group">
        <label>Currency Display</label>
        <select
          className="settings-select"
          value={locale}
          onChange={(e) => handleCurrencyChange(e.target.value)}
        >
          {Object.entries(localeCurrencyMap).map(([loc, {country, currency}]) => (
            <option key={loc} value={loc}>
              {new Intl.DisplayNames([loc], { type: 'region' }).of(loc.split('-')[1])} ({currency})
            </option>
          ))}
        </select>
      </div>
      {profileData?.preferences && (
        <div className="settings-group">
          <label>Email Notifications</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="email-notifications"
              checked={profileData.preferences.emailNotifications}
              onChange={() => {/* Add handler for updating preferences */ }}
            />
            <label htmlFor="email-notifications"></label>
          </div>
        </div>
      )}
    </div>
  )

  const renderCategories = () => (
    <div className="tab-content categories-section">
      <h2>Categories Management</h2>
      {error && <p className="error-message">{error}</p>}
      {subSectionLoading ? <Loading /> :
        <div className="categories-container">
          <div className="categories-actions">
            <div className="action-card">
              <h3>Add New Category</h3>
              <form onSubmit={handleAddCategory} className="category-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="input-field"
                    required
                  />
                  <button type="submit" className="action-button">
                    Add Category
                  </button>
                </div>
              </form>
            </div>

            <div className="action-card">
              <h3>Add New Subcategory</h3>
              <form onSubmit={handleAddSubcategory} className="subcategory-form">
                <div className="input-group">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="select-field"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={`select-${cat._id}`} value={cat.category}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    placeholder="Enter subcategory name"
                    className="input-field"
                    required
                  />
                  <button type="submit" className="action-button">
                    Add Subcategory
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="categories-list-container">
            <h3>Existing Categories</h3>
            <ul className="categories-list">
              {categories.map((cat, index) => (
                <li key={`category-${cat._id}-${index}`} className="category-item">
                  <div className="category-header">
                    <span className="category-name">{cat.category}</span>
                    <button
                      className="delete-button"
                      onClick={() => handleRemoveCategory(cat._id)}
                      aria-label={`Delete category ${cat.category}`}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <ul className="subcategories-list">
                      {cat.subcategories.map((sub, index) => (
                        <li
                          key={`${cat.category}-${sub}-${index}`}
                          className="subcategory-item"
                        >
                          <span className="subcategory-name">{sub}</span>
                          <button
                            className="delete-button"
                            onClick={() => handleRemoveSubcategory(cat._id, sub)}
                            aria-label={`Delete subcategory ${sub}`}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>}
    </div>
  )

  const renderDeleteCard = () => (
    <div className="tab-content">
      <h2>Cards</h2>
      {error && <p className="error-message">{error}</p>}
      
      {subSectionLoading ? <Loading /> :
        <div className="delete-card-section">
          <p className="warning-text">
            Warning:  Deleting your card will permanently remove it along with all associated transactions, which will affect the transaction records, monthly data and chats.
          </p>
          <div className="delete-cards-container">
            {cards.map((card, index) => (
              <li key={`${card._id}-${index}`} className="delete-card-item">
                <div className="delete-card-header">
                  <span className="delete-card-name">{card.cardName} - **** **** **** {card.lastFourDigits}</span>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteCard(card._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </li>
            ))}
          </div>
        </div>
      }
    </div>
  )

  const renderDeleteAccount = () => (
    <div className="tab-content">
      <h2>Delete Account</h2>
      <div className="delete-account-section">
        <p className="warning-text">
          Warning: This action cannot be undone. All your data will be permanently deleted.
        </p>
        <button
          className="delete-account-btn"
          onClick={handleDeleteAccount}
        >
          <FontAwesomeIcon icon={faTrash} /> Delete Account
        </button>
      </div>
    </div>
  )

  if (loading) return <Loading />

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="user-brief">
          <FontAwesomeIcon icon={faUser} className="user-icon" />
          <div className="user-brief-info">
            <h3>{profileData?.name || 'Loading...'}</h3>
            <p>{profileData?.email || 'Loading...'}</p>
          </div>
        </div>

        <nav className="profile-nav">
          <button
            className={`nav-item ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>Personal Info</span>
          </button>

          <button
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </button>

          <button
            className={`nav-item ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            <FontAwesomeIcon icon={faListUl} />
            <span>Categories</span>
          </button>

          <button
            className={`nav-item ${activeTab === "deleteCard" ? "active" : ""}`}
            onClick={() => setActiveTab("deleteCard")}
          >
            <FontAwesomeIcon icon={faCreditCard} />
            <span>Cards</span>
          </button>

          <button
            className={`nav-item ${activeTab === "deleteAccount" ? "active" : ""}`}
            onClick={() => setActiveTab("deleteAccount")}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete Account</span>
          </button>
        </nav>
      </div>

      <div className="profile-content">
        {error && <div className="error-message">{error}</div>}
        {activeTab === "personal" && renderPersonalInfo()}
        {activeTab === "settings" && renderSettings()}
        {activeTab === "categories" && renderCategories()}
        {activeTab === "deleteCard" && renderDeleteCard()}
        {activeTab === "deleteAccount" && renderDeleteAccount()}
      </div>
    </div>
  )
}

export default Profile
