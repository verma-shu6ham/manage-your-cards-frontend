import { useState, useEffect } from "react"
import api from "../services/api"
import "./Profile.css"

function Profile() {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState("")
  const [newSubcategory, setNewSubcategory] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get("/user/categories")
      setCategories(response.data)
    } catch (err) {
      setError("Failed to fetch categories. Please try again.")
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      await api.post("/user/categories", { category: newCategory })
      setNewCategory("")
      fetchCategories()
    } catch (err) {
      setError("Failed to add category. Please try again.")
    }
  }

  const handleAddSubcategory = async (e) => {
    e.preventDefault()
    try {
      await api.post("/user/categories", { category: selectedCategory, subcategory: newSubcategory })
      setNewSubcategory("")
      fetchCategories()
    } catch (err) {
      setError("Failed to add subcategory. Please try again.")
    }
  }

  const handleRemoveCategory = async (category) => {
    try {
      await api.delete("/user/categories", { data: { category } })
      fetchCategories()
    } catch (err) {
      setError("Failed to remove category. Please try again.")
    }
  }

  const handleRemoveSubcategory = async (category, subcategory) => {
    try {
      await api.delete("/user/categories", { data: { category, subcategory } })
      fetchCategories()
    } catch (err) {
      setError("Failed to remove subcategory. Please try again.")
    }
  }

  return (
    <div className="profile">
      <h1>User Profile</h1>
      <div className="categories-section">
        <h2>Categories</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleAddCategory}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category"
            required
          />
          <button type="submit">Add Category</button>
        </form>
        <ul className="categories-list">
          {categories.map((cat) => (
            <li key={cat.category}>
              {cat.category}
              <button onClick={() => handleRemoveCategory(cat.category)}>Remove</button>
              <ul>
                {cat.subcategories.map((sub) => (
                  <li key={sub}>
                    {sub}
                    <button onClick={() => handleRemoveSubcategory(cat.category, sub)}>Remove</button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddSubcategory}>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newSubcategory}
            onChange={(e) => setNewSubcategory(e.target.value)}
            placeholder="New Subcategory"
            required
          />
          <button type="submit">Add Subcategory</button>
        </form>
      </div>
    </div>
  )
}

export default Profile

