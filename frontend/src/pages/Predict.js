import axios from "axios";
import { useEffect, useRef, useState } from "react";

const API = "http://localhost:5000/api";

const SLIDERS = [
  {
    k: "cgpa",
    label: "CGPA",
    min: 5,
    max: 10,
    step: 0.1,
    val: 7.5,
    suf: "/10",
  },
  {
    k: "internships",
    label: "Internships",
    min: 0,
    max: 5,
    step: 1,
    val: 1,
    suf: "",
  },
  {
    k: "communication_skills",
    label: "Communication Skills",
    min: 1,
    max: 10,
    step: 1,
    val: 7,
    suf: "/10",
  },
  {
    k: "technical_skills",
    label: "Technical Skills",
    min: 1,
    max: 10,
    step: 1,
    val: 7,
    suf: "/10",
  },
  {
    k: "aptitude_score",
    label: "Aptitude Score",
    min: 40,
    max: 100,
    step: 1,
    val: 70,
    suf: "/100",
  },
  {
    k: "projects",
    label: "Projects Completed",
    min: 0,
    max: 10,
    step: 1,
    val: 2,
    suf: "",
  },
];

const MODELS = [
  { key: "random_forest", label: "🌲 Random Forest", acc: "87.4%" },
  { key: "logistic_regression", label: "📈 Logistic Regression", acc: "81.2%" },
  { key: "decision_tree", label: "🌿 Decision Tree", acc: "83.6%" },
];

const M_LABELS = {
  random_forest: "Random Forest",
  logistic_regression: "Logistic Regression",
  decision_tree: "Decision Tree",
};

function pct(s, v) {
  return (((v - s.min) / (s.max - s.min)) * 100).toFixed(1) + "%";
}

export default function Predict() {
  const initVals = {};
  SLIDERS.forEach((s) => {
    initVals[s.k] = s.val;
  });
  const [fv, setFv] = useState(initVals);
  const [selectedModel, setSelectedModel] = useState("random_forest");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);
  const formRef = useRef(null);
  const isMobileRef = useRef(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateSlider = (k, v, s) => {
    setFv((prev) => ({ ...prev, [k]: parseFloat(v) }));
  };

  const handleModelButtonClick = (modelKey) => {
    setSelectedModel(modelKey);
    // Focus trap for keyboard users
    if (window.innerWidth < 768) {
      formRef.current?.scroll({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${API}/prediction`, {
        ...fv,
        model: selectedModel,
      });
      setResult(res.data.prediction);

      // Scroll to result on mobile/tablet
      setTimeout(() => {
        if (isMobileRef.current && resultRef.current) {
          resultRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Prediction failed. Make sure the ML service is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getInsights = () => {
    const tips = [];
    if (fv.cgpa < 7)
      tips.push({
        warn: true,
        msg: "Boost your CGPA above 7.0 — many companies filter below this.",
      });
    if (fv.internships === 0)
      tips.push({
        warn: true,
        msg: "Complete at least 1 internship to strengthen your profile.",
      });
    if (fv.technical_skills < 7)
      tips.push({
        warn: true,
        msg: "Strengthen DSA, frameworks & system design skills.",
      });
    if (fv.communication_skills < 7)
      tips.push({
        warn: true,
        msg: "Improve communication — critical for HR and interview rounds.",
      });
    if (fv.projects < 2)
      tips.push({
        warn: true,
        msg: "Build 2+ projects and deploy them to showcase to recruiters.",
      });
    if (fv.aptitude_score < 60)
      tips.push({
        warn: true,
        msg: "Practice aptitude tests — many firms use them for screening.",
      });
    if (tips.length === 0)
      tips.push({
        warn: false,
        msg: "Excellent profile! Apply to top companies with confidence.",
      });
    if (result?.result?.placed && fv.cgpa >= 8)
      tips.push({
        warn: false,
        msg: "High CGPA puts you in premium consideration for tech roles.",
      });
    return tips;
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-title">
          Placement <span className="gradient-text">Predictor</span>
        </div>
        <p className="page-subtitle">
          Adjust sliders to match your profile → get instant AI prediction
        </p>

        <div className="predict-grid">
          {/* FORM */}
          <div className="card" ref={formRef}>
            <div className="sec-heading">Select ML Model</div>
            <div className="model-tabs-wrap">
              <div className="model-tabs" role="tablist">
                {MODELS.map((m) => (
                  <button
                    key={m.key}
                    className={`model-tab${selectedModel === m.key ? " active" : ""}`}
                    onClick={() => handleModelButtonClick(m.key)}
                    type="button"
                    role="tab"
                    aria-selected={selectedModel === m.key}
                    aria-label={`Select ${m.label} model with ${m.acc} accuracy`}
                  >
                    {m.label}{" "}
                    <span style={{ opacity: 0.55, fontSize: "0.75rem" }}>
                      ({m.acc})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {SLIDERS.map((s) => {
                const v = fv[s.k];
                const p = pct(s, v);
                return (
                  <div key={s.k} className="slider-group">
                    <div className="slider-header">
                      <label htmlFor={`slider-${s.k}`} className="slider-label">
                        {s.label}
                      </label>
                      <span
                        className="slider-value"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {v}
                        {s.suf}
                      </span>
                    </div>
                    <input
                      id={`slider-${s.k}`}
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={v}
                      style={{ "--pct": p }}
                      onChange={(e) => updateSlider(s.k, e.target.value, s)}
                      aria-label={`${s.label}, range from ${s.min} to ${s.max}`}
                      aria-valuenow={v}
                      aria-valuemin={s.min}
                      aria-valuemax={s.max}
                    />
                    <div className="range-limits" aria-hidden="true">
                      <span>{s.min}</span>
                      <span>{s.max}</span>
                    </div>
                  </div>
                );
              })}

              {error && (
                <div className="alert alert-error" role="alert">
                  {error}
                </div>
              )}
              <button
                className="btn btn-primary btn-full"
                style={{ padding: "16px", fontSize: "1rem", marginTop: 8 }}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spin" /> Analyzing your profile...
                  </>
                ) : (
                  "🤖 Predict My Placement"
                )}
              </button>
            </form>
          </div>

          {/* RESULT */}
          {result && (
            <div
              className="result-panel"
              ref={resultRef}
              role="region"
              aria-live="polite"
              aria-label="Prediction results"
            >
              {/* Verdict */}
              <div
                className={`result-verdict-card ${result.result.placed ? "result-placed" : "result-not-placed"}`}
              >
                <span className="result-emoji">
                  {result.result.placed ? "🎉" : "📚"}
                </span>
                <div
                  className="result-label"
                  style={{
                    color: result.result.placed ? "var(--s)" : "var(--d)",
                  }}
                >
                  {result.result.placed
                    ? "LIKELY TO BE PLACED"
                    : "NEEDS IMPROVEMENT"}
                </div>
                <div
                  className="result-pct"
                  style={{
                    color: result.result.placed ? "var(--s)" : "var(--d)",
                  }}
                >
                  {result.result.probability}%
                </div>
                <div className="result-sub">Placement Probability</div>
                <div className="result-model-info">
                  Model: {M_LABELS[result.result.model_used]} · Accuracy:{" "}
                  {result.result.model_accuracy}%
                </div>
                <div className="gauge-wrap">
                  <div className="gauge-header">
                    <span>0%</span>
                    <span
                      style={{
                        color: result.result.placed ? "var(--s)" : "var(--d)",
                        fontWeight: 700,
                      }}
                    >
                      {result.result.probability}%
                    </span>
                    <span>100%</span>
                  </div>
                  <div className="gauge-bg">
                    <div
                      className="gauge-fill"
                      style={{
                        width: `${result.result.probability}%`,
                        background: result.result.placed
                          ? "var(--s)"
                          : "var(--d)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Feature Importances */}
              {result.result.feature_importances && (
                <div className="card">
                  <div className="sec-heading">📊 Feature Importance</div>
                  {Object.entries(result.result.feature_importances)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} className="fi-row">
                        <div className="fi-header">
                          <span className="fi-key">{k.replace(/_/g, " ")}</span>
                          <span className="fi-val">{v}%</span>
                        </div>
                        <div className="fi-bg">
                          <div className="fi-fill" style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Insights */}
              <div className="card">
                <div className="sec-heading">💡 Insights & Recommendations</div>
                {getInsights().map((tip, i) => (
                  <div key={i} className="insight-row">
                    <span>{tip.warn ? "⚠️" : "✅"}</span>
                    <span style={{ color: tip.warn ? "var(--w)" : "var(--s)" }}>
                      {tip.msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
