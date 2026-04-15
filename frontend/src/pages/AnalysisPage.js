import React, { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { FaCamera, FaPlay, FaSpinner } from "react-icons/fa";
import "./AnalysisPage.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const BEHAVIORAL_FIELDS = {
  Time_spent_Alone: { label: "Time Spent Alone (hours/day)", type: "number" },
  Social_event_attendance: {
    label: "Social Event Attendance (times/week)",
    type: "number",
  },
  Going_outside: { label: "Going Outside (times/week)", type: "number" },
  Friends_circle_size: { label: "Friends Circle Size", type: "number" },
  Post_frequency: { label: "Social Post Frequency (posts/week)", type: "number" },
  Stage_fear: { label: "Stage Fear", type: "select" },
  Drained_after_socializing: {
    label: "Drained After Socializing",
    type: "select",
  },
};

export default function AnalysisPage() {
  const { isAuthenticated, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [childData, setChildData] = useState({ childId: "", name: "" });
  const [children, setChildren] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [behavioralData, setBehavioralData] = useState({
    Time_spent_Alone: "",
    Social_event_attendance: "",
    Going_outside: "",
    Friends_circle_size: "",
    Post_frequency: "",
    Stage_fear: "",
    Drained_after_socializing: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch children when user wants to save
  const fetchChildren = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/children`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setChildren(data.children);
      }
    } catch (err) {
      console.error("Failed to fetch children:", err);
    }
  };

  const toggleSaveForm = () => {
    if (!showSaveForm) {
      fetchChildren();
    }
    setShowSaveForm(!showSaveForm);
  };

  const processImage = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setError("");
      setResult(null);
    } else {
      setError("Please select a valid image file");
    }
  };

  const isAnalyzable = useMemo(() => {
    if (!selectedImage) return false;
    return Object.values(behavioralData).every((value) => `${value}`.trim() !== "");
  }, [selectedImage, behavioralData]);

  const validateBehavioralData = () => {
    const errors = {};
    Object.entries(BEHAVIORAL_FIELDS).forEach(([key, config]) => {
      const value = behavioralData[key];
      if (`${value}`.trim() === "") {
        errors[key] = "This field is required";
        return;
      }

      if (config.type === "number") {
        const parsed = Number(value);
        if (Number.isNaN(parsed) || parsed < 0) {
          errors[key] = "Enter a valid non-negative number";
        }
      }

      if (config.type === "select" && !["Yes", "No"].includes(value)) {
        errors[key] = "Select Yes or No";
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildBehavioralPayload = () => ({
    Time_spent_Alone: Number(behavioralData.Time_spent_Alone),
    Social_event_attendance: Number(behavioralData.Social_event_attendance),
    Going_outside: Number(behavioralData.Going_outside),
    Friends_circle_size: Number(behavioralData.Friends_circle_size),
    Post_frequency: Number(behavioralData.Post_frequency),
    Stage_fear: behavioralData.Stage_fear,
    Drained_after_socializing: behavioralData.Drained_after_socializing,
  });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImage(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !validateBehavioralData()) {
      setError("Please complete image selection and behavioral details");
      return;
    }

    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const startedAt = performance.now();
      const formData = new FormData();
      formData.append("image", selectedImage);
      const behavioralPayload = buildBehavioralPayload();
      formData.append("behavioral_data", JSON.stringify(behavioralPayload));

      if (process.env.NODE_ENV !== "production") {
        console.log("[analysis] request_start", {
          imageName: selectedImage.name,
          imageSize: selectedImage.size,
          behavioralFields: Object.keys(behavioralPayload),
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        if (process.env.NODE_ENV !== "production") {
          console.log("[analysis] request_success", {
            mode: data?.ensemble?.enabled ? "ensemble" : "image_only",
            status: data?.status,
            elapsedMs: Math.round(performance.now() - startedAt),
          });
        }
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Error during analysis: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAssessment = async () => {
    if (!childData.childId && !childData.name) {
      setError("Please select or enter a child name");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const assessmentData = {
        child_id: childData.childId,
        autism_score: result.autism_score,
        status: result.status,
        facial_features: result.facial_features,
        recommendations: result.recommendations,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/assessment/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assessmentData),
        }
      );

      if (response.ok) {
        setError("");
        setShowSaveForm(false);
        alert("Assessment saved successfully!");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save assessment");
      }
    } catch (err) {
      setError("Error saving assessment: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    const normalized = `${status || ""}`.toLowerCase();
    switch (normalized) {
      case "positive":
      case "autistic":
      case "yes":
        return "#e74c3c";
      case "negative":
      case "non autistic":
      case "no":
        return "#27ae60";
      case "inconclusive":
      case "insufficient information":
        return "#f39c12";
      default:
        return "#95a5a6";
    }
  };

  return (
    <div className="analysis-page">
      <div className="container">
        <h1 className="analysis-title">Autism Detection Analysis</h1>
        <p className="analysis-subtitle">
          Upload a photo and add behavioral context for weighted ensemble analysis.
        </p>

        {error && <div className="analysis-alert">{error}</div>}

        <div className="analysis-content-grid">
          {/* Upload Section */}
          <div className="analysis-upload-section">
            <div
              className={`analysis-upload-box ${
                dragActive ? "analysis-upload-box--active" : ""
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={analyzing}
                className="analysis-file-input"
                id="imageInput"
              />
              <label htmlFor="imageInput" className="analysis-upload-label">
                <FaCamera style={{ fontSize: "2rem", marginBottom: "10px" }} />
                <p>Click to upload or drag and drop</p>
                <small>PNG, JPG, GIF up to 50MB</small>
              </label>
            </div>

            <div className="behavior-card">
              <h3>Behavioral Inputs</h3>
              <p className="behavior-help">
                These fields power the tabular model used in ensemble scoring.
              </p>
              <div className="behavior-grid">
                {Object.entries(BEHAVIORAL_FIELDS).map(([key, config]) => (
                  <div key={key} className="behavior-field">
                    <label htmlFor={key}>{config.label}</label>
                    {config.type === "number" ? (
                      <input
                        id={key}
                        type="number"
                        min="0"
                        step="1"
                        disabled={analyzing}
                        value={behavioralData[key]}
                        onChange={(e) =>
                          setBehavioralData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <select
                        id={key}
                        disabled={analyzing}
                        value={behavioralData[key]}
                        onChange={(e) =>
                          setBehavioralData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    )}
                    {fieldErrors[key] && (
                      <span className="field-error">{fieldErrors[key]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {preview && (
              <div className="analysis-preview-section">
                <h3>Preview</h3>
                <img src={preview} alt="Preview" className="analysis-preview-image" />
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !isAnalyzable}
                  className="analysis-btn analysis-btn--primary"
                >
                  {analyzing ? <FaSpinner className="spin" /> : <FaPlay />}
                  {analyzing ? "Running Analysis..." : "Analyze Image"}
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="analysis-results-section">
              <h2>Analysis Results</h2>

              <div className="analysis-result-card">
                <div className="analysis-score-display">
                  <div
                    className="analysis-score-circle"
                    style={{ borderColor: getStatusColor(result.status) }}
                  >
                    <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
                      {(result.autism_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: "10px 0" }}>
                      Autism Probability Score
                    </h3>
                    <p style={{ color: "#7f8c8d" }}>
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="analysis-status-box" style={{ borderLeftColor: getStatusColor(result.status) }}>
                <h3
                  style={{
                    color: getStatusColor(result.status),
                    margin: "0 0 10px 0",
                  }}
                >
                  Status: {result.status.toUpperCase()}
                </h3>
                <p>{getStatusMessage(result.status)}</p>
              </div>

              <div className="analysis-features-box">
                <h3>Facial Features Analysis</h3>
                <div className="analysis-feature-grid">
                  <div className="analysis-feature-item">
                    <span>Eye Contact</span>
                    <div className="analysis-progress-bar">
                      <div
                        className="analysis-progress-fill"
                        style={{ width: result.facial_features.eye_contact * 100 + "%" }}
                      ></div>
                    </div>
                    <span className="analysis-feature-value">
                      {(result.facial_features.eye_contact * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="analysis-feature-item">
                    <span>Face Symmetry</span>
                    <div className="analysis-progress-bar">
                      <div
                        className="analysis-progress-fill"
                        style={{ width: result.facial_features.face_symmetry * 100 + "%" }}
                      ></div>
                    </div>
                    <span className="analysis-feature-value">
                      {(result.facial_features.face_symmetry * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="analysis-feature-item">
                    <span>Expression Intensity</span>
                    <div className="analysis-progress-bar">
                      <div
                        className="analysis-progress-fill"
                        style={{ width: result.facial_features.expression_intensity * 100 + "%" }}
                      ></div>
                    </div>
                    <span className="analysis-feature-value">
                      {(
                        result.facial_features.expression_intensity * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {result.ensemble && (
                <div className="analysis-ensemble-box">
                  <h3>Ensemble Details</h3>
                  <p>
                    Mode:{" "}
                    <strong>
                      {result.ensemble.enabled ? "Weighted Ensemble" : "Image-only fallback"}
                    </strong>
                  </p>
                  {result.ensemble.enabled ? (
                    <div className="ensemble-grid">
                      <div>
                        <span>Image Score</span>
                        <strong>{(result.ensemble.image_score * 100).toFixed(1)}%</strong>
                      </div>
                      <div>
                        <span>Tabular Score</span>
                        <strong>{(result.ensemble.tabular_score * 100).toFixed(1)}%</strong>
                      </div>
                      <div>
                        <span>Image Weight</span>
                        <strong>{result.ensemble.weights.image_model}</strong>
                      </div>
                      <div>
                        <span>Tabular Weight</span>
                        <strong>{result.ensemble.weights.tabular_model}</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="ensemble-reason">{result.ensemble.reason}</p>
                  )}
                </div>
              )}

              <div className="analysis-recommendations-box">
                <h3>Recommendations</h3>
                <ul className="analysis-recommendations-list">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              {isAuthenticated && (
                <button
                  onClick={toggleSaveForm}
                  className="analysis-btn analysis-btn--success"
                >
                  {showSaveForm ? "Cancel" : "Save Assessment"}
                </button>
              )}

              {showSaveForm && (
                <div className="analysis-save-form">
                  <h3>Save Assessment</h3>
                  {children.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <p>You need to add a child profile first.</p>
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="analysis-btn analysis-btn--success"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="analysis-form-group">
                        <label>Select Child</label>
                        <select
                          value={childData.childId}
                          onChange={(e) => {
                            const selectedChild = children.find(
                              (c) => c.id === parseInt(e.target.value)
                            );
                            setChildData({
                              childId: e.target.value,
                              name: selectedChild ? selectedChild.name : "",
                            });
                          }}
                          className="analysis-input"
                        >
                          <option value="">-- Select a child --</option>
                          {children.map((child) => (
                            <option key={child.id} value={child.id}>
                              {child.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleSaveAssessment}
                        className="analysis-btn analysis-btn--success"
                        disabled={!childData.childId}
                      >
                        Save to Profile
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {!result && !preview && (
            <div className="analysis-info-section">
              <h2>How It Works</h2>
              <div className="analysis-info-steps">
                <div className="analysis-info-step">
                  <div className="analysis-step-num">1</div>
                  <h4>Upload Image</h4>
                  <p>Select a clear photo of the child's face</p>
                </div>
                <div className="analysis-info-step">
                  <div className="analysis-step-num">2</div>
                  <h4>Add Behavioral Inputs</h4>
                  <p>Provide social and behavioral context fields</p>
                </div>
                <div className="analysis-info-step">
                  <div className="analysis-step-num">3</div>
                  <h4>Weighted Ensemble</h4>
                  <p>Image and tabular models are combined with configured weights</p>
                </div>
                <div className="analysis-info-step">
                  <div className="analysis-step-num">4</div>
                  <h4>Get Results</h4>
                  <p>Receive detailed analysis with recommendations</p>
                </div>
                <div className="analysis-info-step">
                  <div className="analysis-step-num">5</div>
                  <h4>Save & Track</h4>
                  <p>Save results and monitor progress over time</p>
                </div>
              </div>

              <div className="analysis-disclaimer-box">
                <h4>⚠️ Important Disclaimer</h4>
                <p>
                  This tool is for screening purposes only and is NOT a
                  diagnostic tool. The results should not be used as a
                  substitute for professional medical advice. Always consult
                  with a qualified healthcare professional for proper diagnosis
                  and treatment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {analyzing && (
        <div className="analysis-loading-overlay">
          <div className="analysis-loading-card">
            <FaSpinner className="spin" />
            <h3>Running Ensemble Analysis</h3>
            <p>Please wait while we process image and behavioral inputs.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusMessage(status) {
  const normalized = `${status || ""}`.toLowerCase();
  switch (normalized) {
    case "positive":
    case "autistic":
    case "yes":
      return "Facial expression patterns suggest potential autism spectrum characteristics. Professional evaluation is recommended.";
    case "negative":
    case "non autistic":
    case "no":
      return "No significant autism indicators detected in the facial expression analysis at this time.";
    case "inconclusive":
    case "insufficient information":
      return "No proper behavioral information was provided. Please complete all behavioral input fields and analyze again.";
    default:
      return "Analysis complete.";
  }
}
