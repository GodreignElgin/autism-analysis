import React from "react";

function ResultsDisplay({ result }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "positive":
        return "#ff6b6b";
      case "negative":
        return "#51cf66";
      case "inconclusive":
        return "#ffd93d";
      default:
        return "#888";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "positive":
        return "⚠️ Autism Indicators Detected";
      case "negative":
        return "✅ No Autism Indicators";
      case "inconclusive":
        return "⏳ Inconclusive Results";
      default:
        return "Unknown Status";
    }
  };

  if (!result) return null;

  return (
    <div className="results-display">
      <div
        className="results-card"
        style={{ borderLeft: `4px solid ${getStatusColor(result.status)}` }}
      >
        <h2>{getStatusLabel(result.status)}</h2>

        <div className="score-section">
          <div className="score-value">
            <span className="score-label">Score:</span>
            <span className="score-number">
              {(result.score * 100).toFixed(1)}%
            </span>
          </div>
          <div className="confidence">
            <span className="confidence-label">Confidence:</span>
            <span className="confidence-value">
              {(result.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {result.features && (
          <div className="features-section">
            <h3>Facial Features Analysis</h3>
            <ul className="features-list">
              <li>
                <strong>Eye Contact:</strong>{" "}
                {(result.features.eye_contact * 100).toFixed(0)}%
              </li>
              <li>
                <strong>Face Symmetry:</strong>{" "}
                {(result.features.face_symmetry * 100).toFixed(0)}%
              </li>
              <li>
                <strong>Expression Intensity:</strong>{" "}
                {(result.features.expression_intensity * 100).toFixed(0)}%
              </li>
              {result.features.face_area_ratio && (
                <li>
                  <strong>Face Area Ratio:</strong>{" "}
                  {(result.features.face_area_ratio * 100).toFixed(1)}%
                </li>
              )}
            </ul>
          </div>
        )}

        {result.recommendations && (
          <div className="recommendations-section">
            <h3>Recommendations</h3>
            <ul className="recommendations-list">
              {result.recommendations.map((rec, idx) => (
                <li key={idx}>💡 {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;
