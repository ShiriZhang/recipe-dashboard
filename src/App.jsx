import { useEffect, useMemo, useState } from "react";
import "./App.css";

function getNutrientValue(recipe, nutrientName) {
  const nutrients = recipe.nutrition?.nutrients || [];
  const nutrient = nutrients.find((item) => item.name === nutrientName);
  return nutrient ? nutrient.amount : 0;
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <h2 className="stat-value">{value}</h2>
    </div>
  );
}

function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dietFilter, setDietFilter] = useState("all");
  const [maxReadyTime, setMaxReadyTime] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        setError("");

        const endpoint =
          `https://api.spoonacular.com/recipes/complexSearch` +
          `?query=pasta` +
          `&number=20` +
          `&addRecipeInformation=true` +
          `&addRecipeNutrition=true` +
          `&instructionsRequired=true` +
          `&apiKey=${API_KEY}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch recipes.");
        }

        const data = await response.json();
        setRecipes(data.results || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [API_KEY]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesDiet = true;

      if (dietFilter === "vegetarian") matchesDiet = recipe.vegetarian;
      if (dietFilter === "vegan") matchesDiet = recipe.vegan;
      if (dietFilter === "glutenFree") matchesDiet = recipe.glutenFree;
      if (dietFilter === "dairyFree") matchesDiet = recipe.dairyFree;

      const matchesReadyTime = (recipe.readyInMinutes || 0) <= maxReadyTime;

      return matchesSearch && matchesDiet && matchesReadyTime;
    });
  }, [recipes, searchTerm, dietFilter, maxReadyTime]);

  const stats = useMemo(() => {
    const total = filteredRecipes.length;

    const avgReadyTime =
      total === 0
        ? 0
        : Math.round(
          filteredRecipes.reduce(
            (sum, recipe) => sum + (recipe.readyInMinutes || 0),
            0
          ) / total
        );

    const vegetarianCount = filteredRecipes.filter(
      (recipe) => recipe.vegetarian
    ).length;

    const avgCalories =
      total === 0
        ? 0
        : Math.round(
          filteredRecipes.reduce(
            (sum, recipe) => sum + getNutrientValue(recipe, "Calories"),
            0
          ) / total
        );

    return {
      total,
      avgReadyTime,
      vegetarianCount,
      avgCalories,
    };
  }, [filteredRecipes]);

  if (loading) {
    return <p className="status-message">Loading recipes...</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    <div className="app">
      <header className="hero">
        <h1>Quick Recipe Explorer</h1>
        <p>
          A dashboard exploring pasta recipes from Spoonacular.
          Search by title, filter by diet, and compare cooking time and
          nutrition at a glance.
        </p>
      </header>

      <section className="stats-grid">
        <StatCard label="Visible recipes" value={stats.total} />
        <StatCard label="Average ready time" value={`${stats.avgReadyTime} min`} />
        <StatCard label="Vegetarian recipes" value={stats.vegetarianCount} />
        <StatCard label="Average calories" value={stats.avgCalories} />
      </section>

      <section className="controls">
        <div className="control-group">
          <label htmlFor="search">Search by title</label>
          <input
            id="search"
            type="text"
            placeholder="Try 'garlic' or 'tomato'"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="control-group">
          <label htmlFor="diet">Filter by diet</label>
          <select
            id="diet"
            value={dietFilter}
            onChange={(event) => setDietFilter(event.target.value)}
          >
            <option value="all">All recipes</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="glutenFree">Gluten Free</option>
            <option value="dairyFree">Dairy Free</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="time">
            Max ready time: {maxReadyTime} minutes
          </label>
          <input
            id="time"
            type="range"
            min="10"
            max="120"
            step="5"
            value={maxReadyTime}
            onChange={(event) => setMaxReadyTime(Number(event.target.value))}
          />
        </div>
      </section>

      <section className="table-section">
        <div className="table-header">
          <span>Recipe</span>
          <span>Ready Time</span>
          <span>Servings</span>
          <span>Calories</span>
          <span>Diet Tags</span>
        </div>

        {filteredRecipes.map((recipe) => {
          const dietTags = [
            recipe.vegetarian ? "Vegetarian" : null,
            recipe.vegan ? "Vegan" : null,
            recipe.glutenFree ? "Gluten Free" : null,
            recipe.dairyFree ? "Dairy Free" : null,
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <div className="table-row" key={recipe.id}>
              <span className="recipe-title">{recipe.title}</span>
              <span>{recipe.readyInMinutes || "N/A"} min</span>
              <span>{recipe.servings || "N/A"}</span>
              <span>{Math.round(getNutrientValue(recipe, "Calories"))}</span>
              <span>{dietTags || "None"}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default App;