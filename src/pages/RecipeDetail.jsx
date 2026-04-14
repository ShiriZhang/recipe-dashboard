import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import '../App.css'

function getNutrientValue(nutrients, name) {
    const n = nutrients.find(item => item.name === name)
    return n ? Math.round(n.amount) : 'N/A'
}

function RecipeDetail() {
    // useParams() reads the :id from the URL
    // If the URL is /recipe/716429, then id === "716429"
    const { id } = useParams()

    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY

    useEffect(() => {
        async function fetchRecipeDetail() {
            try {
                setLoading(true)
                // Use the id from the URL to fetch THIS specific recipe
                const response = await fetch(
                    `https://api.spoonacular.com/recipes/${id}/information` +
                    `?includeNutrition=true&apiKey=${API_KEY}`
                )
                if (!response.ok) throw new Error('Recipe not found.')
                const data = await response.json()
                setRecipe(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchRecipeDetail()
    }, [id, API_KEY])  // re-runs if id changes (user navigates to a different recipe)

    if (loading) return <p className="status-message">Loading recipe...</p>
    if (error) return (
        <div className="status-message error">
            <p>{error}</p>
            <Link to="/" className="back-link">← Back to Dashboard</Link>
        </div>
    )
    if (!recipe) return null

    const nutrients = recipe.nutrition?.nutrients || []
    const dietTags = [
        recipe.vegetarian && 'Vegetarian',
        recipe.vegan && 'Vegan',
        recipe.glutenFree && 'Gluten Free',
        recipe.dairyFree && 'Dairy Free',
    ].filter(Boolean)

    return (
        <div className="app">
            {/* Back link — Link replaces <a href> for in-app navigation */}
            <Link to="/" className="back-link">← Back to Dashboard</Link>

            <div className="detail-layout">
                <div className="detail-main">
                    <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="detail-image"
                    />
                    <h1 className="detail-title">{recipe.title}</h1>

                    <div className="detail-meta">
                        <span>⏱ {recipe.readyInMinutes} min</span>
                        <span>🍽 {recipe.servings} servings</span>
                        <span>❤️ {recipe.aggregateLikes} likes</span>
                        {recipe.cheap && <span>💰 Budget-friendly</span>}
                    </div>

                    {dietTags.length > 0 && (
                        <div className="diet-tags">
                            {dietTags.map(tag => (
                                <span key={tag} className="diet-tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Summary comes as HTML from Spoonacular — dangerouslySetInnerHTML renders it */}
                    <div
                        className="detail-summary"
                        dangerouslySetInnerHTML={{ __html: recipe.summary }}
                    />

                    <h2>Ingredients</h2>
                    <ul className="ingredients-list">
                        {(recipe.extendedIngredients || []).map(ing => (
                            <li key={ing.id}>{ing.original}</li>
                        ))}
                    </ul>
                </div>

                {/* Sidebar with nutrition facts */}
                <aside className="detail-sidebar">
                    <h2>Nutrition Facts</h2>
                    <p className="sidebar-note">Per serving</p>
                    <div className="nutrition-grid">
                        {[
                            { name: 'Calories', unit: 'kcal' },
                            { name: 'Protein', unit: 'g' },
                            { name: 'Carbohydrates', unit: 'g' },
                            { name: 'Fat', unit: 'g' },
                            { name: 'Fiber', unit: 'g' },
                            { name: 'Sugar', unit: 'g' },
                            { name: 'Sodium', unit: 'mg' },
                        ].map(({ name, unit }) => (
                            <div key={name} className="nutrition-item">
                                <span className="nutrition-name">{name}</span>
                                <span className="nutrition-value">
                                    {getNutrientValue(nutrients, name)} {unit}
                                </span>
                            </div>
                        ))}
                    </div>

                    <h2 style={{ marginTop: '24px' }}>Quick Facts</h2>
                    <div className="nutrition-grid">
                        <div className="nutrition-item">
                            <span className="nutrition-name">Health Score</span>
                            <span className="nutrition-value">{recipe.healthScore}/100</span>
                        </div>
                        <div className="nutrition-item">
                            <span className="nutrition-name">Price/Serving</span>
                            <span className="nutrition-value">${(recipe.pricePerServing / 100).toFixed(2)}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default RecipeDetail