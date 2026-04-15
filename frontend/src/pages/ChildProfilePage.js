import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChildProfilePage() {
  const { childId } = useParams();
  const { token } = useContext(AuthContext);
  const [child, setChild] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ type: "observation", content: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/children/${childId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setChild(data.child);
          setAssessments(data.assessments);
          setNotes(data.notes);
        }
      } catch (err) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchChildDetails();
  }, [childId, token]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/children/${childId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newNote),
        }
      );
      if (response.ok) {
        setNewNote({ type: "observation", content: "" });
        // Reload child details after adding note
        const getResponse = await fetch(
          `http://localhost:5000/api/children/${childId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await getResponse.json();
        if (getResponse.ok) {
          setChild(data.child);
          setAssessments(data.assessments);
          setNotes(data.notes);
        }
      }
    } catch (err) {
      // Error handled silently
    }
  };

  const chartData = assessments.map((a) => ({
    date: new Date(a.date).toLocaleDateString(),
    score: (a.score * 100).toFixed(1),
    timestamp: a.date,
  }));

  if (loading) return <div style={styles.container}>Loading...</div>;
  if (!child) return <div style={styles.container}>Child not found</div>;

  return (
    <div style={styles.container}>
      <div className="container">
        <h1 style={styles.title}>{child.name}'s Profile</h1>

        <div style={styles.infoCard}>
          <div style={styles.infoGrid}>
            <div>
              <label>Name</label>
              <p style={styles.infoValue}>{child.name}</p>
            </div>
            {child.age && (
              <div>
                <label>Age</label>
                <p style={styles.infoValue}>{child.age} years</p>
              </div>
            )}
            {child.gender && (
              <div>
                <label>Gender</label>
                <p style={styles.infoValue}>{child.gender}</p>
              </div>
            )}
          </div>
        </div>

        {assessments.length > 0 && (
          <div style={styles.chartCard}>
            <h2>Assessment Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#667eea"
                  name="Autism Score (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={styles.assessmentsSection}>
          <h2>Recent Assessments ({assessments.length})</h2>
          {assessments.length === 0 ? (
            <p style={styles.emptyText}>No assessments yet</p>
          ) : (
            <div style={styles.assessmentsList}>
              {assessments.map((a) => (
                <div key={a.id} style={styles.assessmentItem}>
                  <div style={styles.assessmentHeader}>
                    <span style={styles.date}>
                      {new Date(a.date).toLocaleDateString()}
                    </span>
                    <span
                      style={{
                        ...styles.status,
                        backgroundColor:
                          a.status === "positive"
                            ? "#e74c3c"
                            : a.status === "negative"
                            ? "#27ae60"
                            : "#f39c12",
                      }}
                    >
                      {a.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={styles.score}>
                    Score: {(a.score * 100).toFixed(1)}%
                  </div>
                  {a.recommendations && (
                    <div style={styles.recommendations}>
                      <strong>Recommendations:</strong>
                      <ul style={styles.recList}>
                        {a.recommendations.slice(0, 2).map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.notesSection}>
          <h2>Progress Notes</h2>
          <form onSubmit={handleAddNote} style={styles.noteForm}>
            <div style={styles.formGroup}>
              <label>Note Type</label>
              <select
                value={newNote.type}
                onChange={(e) =>
                  setNewNote((prev) => ({ ...prev, type: e.target.value }))
                }
                style={styles.select}
              >
                <option value="observation">Observation</option>
                <option value="milestone">Milestone</option>
                <option value="concern">Concern</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Note</label>
              <textarea
                value={newNote.content}
                onChange={(e) =>
                  setNewNote((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Add your observation..."
                required
                style={styles.textarea}
              />
            </div>
            <button type="submit" style={styles.submitButton}>
              Add Note
            </button>
          </form>

          <div style={styles.notesList}>
            {notes.length === 0 ? (
              <p style={styles.emptyText}>No notes yet</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} style={styles.noteItem}>
                  <div style={styles.noteHeader}>
                    <span style={styles.noteType}>{n.type}</span>
                    <span style={styles.noteDate}>
                      {new Date(n.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    backgroundColor: "#f8f9fa",
    minHeight: "80vh",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#2c3e50",
  },
  infoCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
  },
  infoValue: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#667eea",
    margin: "5px 0 0 0",
  },
  chartCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  assessmentsSection: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  assessmentsList: {
    display: "grid",
    gap: "15px",
  },
  assessmentItem: {
    border: "1px solid #ecf0f1",
    padding: "15px",
    borderRadius: "4px",
    backgroundColor: "#f8f9fa",
  },
  assessmentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  date: {
    color: "#7f8c8d",
  },
  status: {
    color: "white",
    padding: "4px 12px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  score: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: "10px",
  },
  recommendations: {
    marginTop: "10px",
  },
  recList: {
    paddingLeft: "20px",
    marginTop: "5px",
    fontSize: "0.9rem",
  },
  notesSection: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  noteForm: {
    marginBottom: "25px",
    paddingBottom: "25px",
    borderBottom: "1px solid #ecf0f1",
  },
  formGroup: {
    marginBottom: "15px",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginTop: "5px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginTop: "5px",
    minHeight: "100px",
    fontFamily: "inherit",
  },
  submitButton: {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  notesList: {
    display: "grid",
    gap: "15px",
  },
  noteItem: {
    border: "1px solid #ecf0f1",
    padding: "15px",
    borderRadius: "4px",
    backgroundColor: "#f8f9fa",
  },
  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  noteType: {
    backgroundColor: "#667eea",
    color: "white",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "0.8rem",
  },
  noteDate: {
    color: "#7f8c8d",
    fontSize: "0.9rem",
  },
  emptyText: {
    color: "#95a5a6",
    textAlign: "center",
    padding: "20px",
  },
};
