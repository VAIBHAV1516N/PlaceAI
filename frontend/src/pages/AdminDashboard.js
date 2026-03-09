import axios from "axios";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API = "http://localhost:5000/api";
const M_LABELS = {
  random_forest: "Random Forest",
  logistic_regression: "Logistic Regression",
  decision_tree: "Decision Tree",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/admin/stats`),
      axios.get(`${API}/admin/predictions`),
    ])
      .then(([s, p]) => {
        setStats(s.data);
        setPredictions(p.data.predictions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );

  const filteredPredictions =
    filterStatus === "all"
      ? predictions
      : filterStatus === "placed"
        ? predictions.filter((p) => p.result.placed)
        : predictions.filter((p) => !p.result.placed);

  const pieData = stats
    ? [
        { name: "Placed", value: stats.placedCount, fill: "#10b981" },
        { name: "Not Placed", value: stats.notPlacedCount, fill: "#f43f5e" },
      ]
    : [];

  const modelData =
    stats?.modelStats?.map((m) => ({
      name: (m._id || "Unknown").replace("_", " "),
      count: m.count,
    })) || [];

  const statCards = stats
    ? [
        { label: "Total Students", value: stats.totalStudents },
        { label: "Total Predictions", value: stats.totalPredictions },
        { label: "Placement Rate", value: `${stats.placementRate}%` },
        { label: "Avg CGPA", value: stats.avgCgpa },
        { label: "Avg Probability", value: `${stats.avgProbability}%` },
      ]
    : [];

  return (
    <div className="page">
      <div className="container">
        <div className="page-title">
          Admin <span className="gradient-text">Dashboard</span>
        </div>
        <p className="page-subtitle">
          Placement analytics and student performance insights
        </p>

        {/* Stats */}
        <div className="stats-grid">
          {statCards.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="charts-row">
          <div className="chart-card">
            <h3>Placement Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--c1)",
                    border: "1px solid var(--br)",
                    borderRadius: 8,
                    color: "var(--tx)",
                  }}
                />
                <Legend wrapperStyle={{ color: "var(--tm)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Model Usage Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={modelData}
                margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--tm)", fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: "var(--tm)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--c1)",
                    border: "1px solid var(--br)",
                    borderRadius: 8,
                    color: "var(--tx)",
                  }}
                />
                <Bar dataKey="count" fill="var(--p)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictions Table/Cards */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "20px 20px 0" }}>
            <div className="sec-heading">All Student Predictions</div>
            <div style={{ marginBottom: "16px" }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-control"
                style={{ maxWidth: "200px" }}
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

          {/* Mobile cards */}
          <div
            className="admin-mobile-cards"
            style={{ padding: "0 16px 16px" }}
          >
            {filteredPredictions.map((p) => (
              <div key={p._id} className="history-card">
                <div className="history-card-top">
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {p.userId?.name || p.studentName}
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
                    <strong>{p.inputs.technical_skills}/10</strong>Tech
                  </div>
                  <div className="history-stat">
                    <strong>{p.inputs.communication_skills}/10</strong>Comm.
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
                    marginTop: 8,
                    fontSize: "0.78rem",
                    color: "var(--ts)",
                  }}
                >
                  {p.userId?.email} · {M_LABELS[p.result.model_used]}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="admin-table-desktop">
            <table summary="All student predictions with details and results">
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Email</th>
                  <th scope="col">CGPA</th>
                  <th scope="col">Tech</th>
                  <th scope="col">Comm.</th>
                  <th scope="col">Model</th>
                  <th scope="col">Probability</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {filteredPredictions.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>
                      {p.userId?.name || p.studentName}
                    </td>
                    <td style={{ color: "var(--ts)", fontSize: "0.82rem" }}>
                      {p.userId?.email}
                    </td>
                    <td>{p.inputs.cgpa}</td>
                    <td>{p.inputs.technical_skills}/10</td>
                    <td>{p.inputs.communication_skills}/10</td>
                    <td style={{ fontSize: "0.78rem", color: "var(--ts)" }}>
                      {M_LABELS[p.result.model_used]}
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: p.result.placed ? "var(--s)" : "var(--d)",
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
      </div>
    </div>
  );
}
