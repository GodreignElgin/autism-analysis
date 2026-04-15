import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { FaPlus } from "react-icons/fa";

export default function DashboardPage() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", age: "", gender: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/children", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setChildren(data.children);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to load children: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [token]);

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newChild),
      });
      const data = await response.json();
      if (response.ok) {
        setChildren([...children, data.child]);
        setNewChild({ name: "", age: "", gender: "" });
        setShowAddChild(false);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to add child: " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div className="container">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Welcome, {user?.full_name}</h1>
            <p style={styles.subtitle}>
              Manage your children's assessments and progress
            </p>
          </div>
          <button
            onClick={() => setShowAddChild(!showAddChild)}
            style={styles.addButton}
          >
            <FaPlus /> Add Child
          </button>
        </div>

        {error && <div style={styles.alert}>{error}</div>}

        {showAddChild && (
          <div style={styles.addChildForm}>
            <h2>Add New Child</h2>
            <form onSubmit={handleAddChild} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Child's Name</label>
                <input
                  type="text"
                  value={newChild.name}
                  onChange={(e) =>
                    setNewChild((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>Age</label>
                  <input
                    type="number"
                    value={newChild.age}
                    onChange={(e) =>
                      setNewChild((prev) => ({ ...prev, age: e.target.value }))
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Gender</label>
                  <select
                    value={newChild.gender}
                    onChange={(e) =>
                      setNewChild((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    style={styles.input}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div style={styles.formButtons}>
                <button type="submit" style={styles.submitButton}>
                  Add Child
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddChild(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={styles.spinner}>Loading...</div>
        ) : children.length === 0 ? (
          <div style={styles.emptyState}>
            <h2>No children added yet</h2>
            <p>Add your first child to get started with assessments</p>
            <button
              onClick={() => setShowAddChild(true)}
              style={styles.addButton}
            >
              <FaPlus /> Add Child
            </button>
          </div>
        ) : (
          <div style={styles.childrenGrid}>
            {children.map((child) => (
              <div key={child.id} style={styles.childCard}>
                <div style={styles.childHeader}>
                  <h3>{child.name}</h3>
                  {child.age && (
                    <span style={styles.age}>{child.age} years</span>
                  )}
                </div>
                {child.gender && (
                  <p style={styles.gender}>Gender: {child.gender}</p>
                )}
                <p style={styles.assessmentCount}>
                  {child.assessments_count} Assessment
                  {child.assessments_count !== 1 ? "s" : ""}
                </p>
                <div style={styles.cardButtons}>
                  <button
                    onClick={() => navigate(`/child/${child.id}`)}
                    style={styles.viewButton}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.statsSection}>
          <h2>Quick Stats</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{children.length}</div>
              <div style={styles.statLabel}>Children</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {children.reduce((sum, c) => sum + c.assessments_count, 0)}
              </div>
              <div style={styles.statLabel}>Total Assessments</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>24/7</div>
              <div style={styles.statLabel}>Chat Support</div>
            </div>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
  },
  subtitle: {
    color: "#7f8c8d",
    margin: "5px 0 0 0",
  },
  addButton: {
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold",
  },
  alert: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  addChildForm: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  form: {
    marginTop: "20px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginTop: "5px",
  },
  formButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  submitButton: {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  spinner: {
    textAlign: "center",
    padding: "40px",
    color: "#7f8c8d",
  },
  emptyState: {
    backgroundColor: "white",
    padding: "60px 30px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "30px",
  },
  childrenGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  childCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.3s",
  },
  childHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  age: {
    backgroundColor: "#e8f4f8",
    color: "#2c3e50",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.85rem",
  },
  gender: {
    color: "#7f8c8d",
    marginBottom: "10px",
  },
  assessmentCount: {
    color: "#667eea",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  cardButtons: {
    display: "flex",
    gap: "10px",
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  statsSection: {
    marginTop: "40px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: "10px",
  },
  statLabel: {
    color: "#7f8c8d",
  },
};
