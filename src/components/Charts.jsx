import { useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts'

// Helper to shorten long recipe titles for axis labels
function shortenTitle(title) {
    return title.length > 20 ? title.slice(0, 18) + '…' : title
}

function getNutrientValue(recipe, name) {
    const nutrients = recipe.nutrition?.nutrients || []
    const n = nutrients.find(item => item.name === name)
    return n ? Math.round(n.amount) : 0
}

// ---- FEATURE: toggle between charts ----
// We use a piece of state to track which chart is visible.
// This teaches you how local component state controls UI.

function Charts({ recipes }) {
    const [activeChart, setActiveChart] = useState('time') // 'time' or 'calories'

    // Transform recipe data into the shape Recharts expects: [{name, value}, ...]
    const timeData = recipes.map(r => ({
        name: shortenTitle(r.title),
        minutes: r.readyInMinutes || 0,
    }))

    const calorieData = recipes.map(r => ({
        name: shortenTitle(r.title),
        calories: getNutrientValue(r, 'Calories'),
    }))

    return (
        <section className="charts-section">
            <div className="chart-toggle">
                <button
                    className={activeChart === 'time' ? 'toggle-btn active' : 'toggle-btn'}
                    onClick={() => setActiveChart('time')}
                >
                    ⏱ Cooking Time
                </button>
                <button
                    className={activeChart === 'calories' ? 'toggle-btn active' : 'toggle-btn'}
                    onClick={() => setActiveChart('calories')}
                >
                    🔥 Calories
                </button>
            </div>

            {/* Chart 1: Cooking Time */}
            {activeChart === 'time' && (
                <div className="chart-container">
                    <h3 className="chart-title">Cooking Time by Recipe (minutes)</h3>
                    <p className="chart-description">
                        Which recipes are quickest? Bars under 30 minutes are great for weeknights.
                    </p>
                    {/* ResponsiveContainer makes the chart fill its parent's width */}
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={timeData} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                angle={-40}
                                textAnchor="end"
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis unit=" min" tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value) => [`${value} min`, 'Ready In']} />
                            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                                {timeData.map((entry, index) => (
                                    // Color bars: green if quick (≤30 min), orange otherwise
                                    <Cell
                                        key={index}
                                        fill={entry.minutes <= 30 ? '#10b981' : '#f59e0b'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="chart-legend">
                        <span style={{ color: '#10b981' }}>■</span> ≤ 30 min &nbsp;
                        <span style={{ color: '#f59e0b' }}>■</span> &gt; 30 min
                    </p>
                </div>
            )}

            {/* Chart 2: Calories */}
            {activeChart === 'calories' && (
                <div className="chart-container">
                    <h3 className="chart-title">Calories per Serving by Recipe</h3>
                    <p className="chart-description">
                        Lighter options tend to be vegetable-based. Heavy hitters often feature meat and cheese.
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={calorieData} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                angle={-40}
                                textAnchor="end"
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis unit=" kcal" tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value) => [`${value} kcal`, 'Calories']} />
                            <Bar dataKey="calories" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    )
}

export default Charts