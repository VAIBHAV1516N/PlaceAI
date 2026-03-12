import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const M_LABELS = {
  random_forest: "Random Forest",
  logistic_regression: "Logistic Regression",
  decision_tree: "Decision Tree",
};

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [filterPlaced, setFilterPlaced] = useState("all");

  useEffect(() => {
    axios
      .get(`${API}/prediction/my`)
      .then((res) => setPredictions(res.data.predictions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getSortedPredictions = () => {
    let sorted = [...predictions];

    // Filter
    if (filterPlaced === "placed") {
      sorted = sorted.filter((p) => p.result.placed);
    } else if (filterPlaced === "not-placed") {
      sorted = sorted.filter((p) => !p.result.placed);
    }

    // Sort
    if (sortBy === "date") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "probability") {
      sorted.sort((a, b) => b.result.probability - a.result.probability);
    } else if (sortBy === "cgpa") {
      sorted.sort((a, b) => b.inputs.cgpa - a.inputs.cgpa);
    }

    return sorted;
  };

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );

  const sortedPredictions = getSortedPredictions();

  return (
    <div className="page">
      <div className="container">
        <div className="page-title">
          Prediction <span className="gradient-text">History</span>
        </div>
        <p className="page-subtitle">
          All your past placement predictions and analytics
        </p>

        {predictions.length === 0 ? (
          <div className="card empty-state">
            <span className="empty-icon">📭</span>
            <h3>No predictions yet</h3>
            <p>Go to Predict to make your first one!</p>
            <div style={{ marginTop: 20 }}>
              <Link to="/predict" className="btn btn-primary">
                Make a Prediction →
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filters & Sort */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="sort-by" className="form-label">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  className="form-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Most Recent</option>
                  <option value="probability">Highest Probability</option>
                  <option value="cgpa">Highest CGPA</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="filter-status" className="form-label">
                  Filter Status
                </label>
                <select
                  id="filter-status"
                  className="form-control"
                  value={filterPlaced}
                  onChange={(e) => setFilterPlaced(e.target.value)}
                >
                  <option value="all">All ({predictions.length})</option>
                  <option value="placed">
                    Placed ({predictions.filter((p) => p.result.placed).length})
                  </option>
                  <option value="not-placed">
                    Not Placed (
                    {predictions.filter((p) => !p.result.placed).length})
                  </option>
                </select>
              </div>
            </div>

            {sortedPredictions.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: "center", padding: "40px 20px" }}
              >
                <p style={{ color: "var(--tm)" }}>
                  No predictions match your filters
                </p>
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div
                  className="history-cards"
                  role="region"
                  aria-label="Mobile prediction cards"
                >
                  {sortedPredictions.map((p) => (
                    <div key={p._id} className="history-card">
                      <div className="history-card-top">
                        <span className="history-card-date">
                          📅 {new Date(p.createdAt).toLocaleDateString("en-IN")}
                        </span>
                        <span
                          className={`badge ${p.result.placed ? "badge-success" : "badge-danger"}`}
                          role="status"
                        >
                          {p.result.placed ? "Placed" : "Not Placed"}
                        </span>
                      </div>
                      <div className="history-card-grid">
                        <div className="history-stat">
                          <strong>{p.inputs.cgpa}</strong>CGPA
                        </div>
                        <div className="history-stat">
                          <strong>{p.inputs.internships}</strong>Internships
                        </div>
                        <div className="history-stat">
                          <strong>{p.inputs.technical_skills}/10</strong>Tech
                          Skills
                        </div>
                        <div className="history-stat">
                          <strong>{p.inputs.communication_skills}/10</strong>
                          Comm.
                        </div>
                        <div className="history-stat">
                          <strong>{p.inputs.aptitude_score}</strong>Aptitude
                        </div>
                        <div className="history-stat">
                          <strong
                            style={{
                              color: p.result.placed ? "var(--s)" : "var(--d)",
                              fontSize: "1.1rem",
                            }}
                          >
                            {p.result.probability}%
                          </strong>
                          Probability
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: "0.78rem",
                          color: "var(--ts)",
                        }}
                      >
                        {M_LABELS[p.result.model_used]} ·{" "}
                        {p.result.model_accuracy}% accuracy
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div
                  className="card"
                  style={{ padding: 0 }}
                  role="region"
                  aria-label="Desktop prediction table"
                >
                  <div className="table-wrapper">
                    <table summary="Prediction history with student details and results">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">CGPA</th>
                          <th scope="col">Intern.</th>
                          <th scope="col">Tech</th>
                          <th scope="col">Comm.</th>
                          <th scope="col">Aptitude</th>
                          <th scope="col">Projects</th>
                          <th scope="col">Model</th>
                          <th scope="col">Probability</th>
                          <th scope="col">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedPredictions.map((p) => (
                          <tr key={p._id}>
                            <td
                              style={{ color: "var(--ts)", fontSize: "0.8rem" }}
                            >
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                            <td>{p.inputs.cgpa}</td>
                            <td>{p.inputs.internships}</td>
                            <td>{p.inputs.technical_skills}/10</td>
                            <td>{p.inputs.communication_skills}/10</td>
                            <td>{p.inputs.aptitude_score}</td>
                            <td>{p.inputs.projects}</td>
                            <td
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--ts)",
                              }}
                            >
                              {M_LABELS[p.result.model_used]}
                            </td>
                            <td
                              style={{
                                fontWeight: 700,
                                color: p.result.placed
                                  ? "var(--s)"
                                  : "var(--d)",
                              }}
                            >
                              {p.result.probability}%
                            </td>
                            <td>
                              <span
                                className={`badge ${p.result.placed ? "badge-success" : "badge-danger"}`}
                              >
                                {p.result.placed ? "Placed" : "Not Placed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
