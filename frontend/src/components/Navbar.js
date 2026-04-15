import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./Navbar.css";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUpload,
  FaChartLine,
  FaComments,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

// Logo Component (unused but kept for reference)
const Logo = () => (
  <Link to="/" style={{ display: "block", textDecoration: "none" }}>
    <svg
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        outline: "none",
        border: "none",
        display: "block",
        boxShadow: "none",
        cursor: "pointer",
        userSelect: "none",
      }}
      tabIndex="-1"
    >
          <circle cx="21" cy="21" r="20" fill="white" fillOpacity="0.95" />   {" "}
      <path
        d="M21 8C14.373 8 9 13.373 9 20c0 4.418 2.389 8.282 5.938 10.359.488.09.667-.212.667-.47 0-.233-.009-.853-.014-1.675-3.338.726-4.042-1.61-4.042-1.61-.444-1.13-1.083-1.43-1.083-1.43-.885-.606.067-.594.067-.594.979.07 1.494 1.006 1.494 1.006.87 1.492 2.282 1.061 2.838.81.088-.63.34-1.061.618-1.305-2.164-.246-4.438-1.082-4.438-4.815 0-1.064.38-1.933 1.005-2.614-.1-.247-.435-1.238.096-2.58 0 0 .82-.263 2.685 1.002A9.355 9.355 0 0121 16.078a9.35 9.35 0 012.461.331c1.864-1.265 2.684-1.002 2.684-1.002.532 1.342.197 2.333.097 2.58.626.681 1.004 1.55 1.004 2.614 0 3.742-2.278 4.566-4.448 4.806.35.301.662.896.662 1.806 0 1.305-.012 2.357-.012 2.678 0 .26.177.565.672.469C30.61 28.278 33 24.416 33 20c0-6.627-5.373-12-12-12z"
        fill="#667eea"
      />
          <circle cx="15" cy="18" r="2" fill="#667eea" />
          <circle cx="27" cy="18" r="2" fill="#667eea" />   {" "}
      <path
        d="M21 28c-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 3.314-2.686 6-6 6z"
        fill="#667eea"
      />{" "}
    </svg>
  </Link>
);
export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoText}>
            <svg
              width="42"
              height="42"
              viewBox="0 0 42 42"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                outline: "none",
                border: "none",
                display: "block",
                boxShadow: "none",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <circle cx="21" cy="21" r="20" fill="white" fillOpacity="0.95" />
              <path
                d="M21 8C14.373 8 9 13.373 9 20c0 4.418 2.389 8.282 5.938 10.359.488.09.667-.212.667-.47 0-.233-.009-.853-.014-1.675-3.338.726-4.042-1.61-4.042-1.61-.444-1.13-1.083-1.43-1.083-1.43-.885-.606.067-.594.067-.594.979.07 1.494 1.006 1.494 1.006.87 1.492 2.282 1.061 2.838.81.088-.63.34-1.061.618-1.305-2.164-.246-4.438-1.082-4.438-4.815 0-1.064.38-1.933 1.005-2.614-.1-.247-.435-1.238.096-2.58 0 0 .82-.263 2.685 1.002A9.355 9.355 0 0121 16.078a9.35 9.35 0 012.461.331c1.864-1.265 2.684-1.002 2.684-1.002.532 1.342.197 2.333.097 2.58.626.681 1.004 1.55 1.004 2.614 0 3.742-2.278 4.566-4.448 4.806.35.301.662.896.662 1.806 0 1.305-.012 2.357-.012 2.678 0 .26.177.565.672.469C30.61 28.278 33 24.416 33 20c0-6.627-5.373-12-12-12z"
                fill="#667eea"
              />
              <circle cx="15" cy="18" r="2" fill="#667eea" />
              <circle cx="27" cy="18" r="2" fill="#667eea" />
              <path
                d="M21 28c-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 3.314-2.686 6-6 6z"
                fill="#667eea"
              />
            </svg>
            <span style={{ outline: "none", border: "none" }}>
              Autism Detection
            </span>
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={styles.mobileMenuButton}
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        <div
          style={{
            ...styles.navLinks,
            display:
              window.innerWidth <= 768 && !mobileMenuOpen ? "none" : "flex",
          }}
        >
          <Link to="/" style={styles.navLink}>
            <FaHome /> Home
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" style={styles.navLink}>
                <FaSignInAlt /> Login
              </Link>
              <Link to="/register" style={styles.navLink}>
                <FaUserPlus /> Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/analyze" style={styles.navLink}>
                <FaUpload /> Analyze
              </Link>
              <Link to="/dashboard" style={styles.navLink}>
                <FaChartLine /> Dashboard
              </Link>
              <Link to="/chat" style={styles.navLink}>
                <FaComments /> Chat
              </Link>
              <div style={styles.userSection}>
                <span style={styles.userName}>{user?.full_name}</span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "1.2rem 0",
    boxShadow:
      "0 4px 20px rgba(102, 126, 234, 0.3), 0 0 40px rgba(102, 126, 234, 0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backdropFilter: "blur(10px)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    textDecoration: "none",
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.3s ease",
    display: "flex",
    alignItems: "center",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    userSelect: "none",
  },
  logoText: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    outline: "none",
    border: "none",
    boxShadow: "none",
  },
  navLinks: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    flexDirection: window.innerWidth <= 768 ? "column" : "row",
    position: window.innerWidth <= 768 ? "absolute" : "relative",
    top: window.innerWidth <= 768 ? "70px" : "auto",
    left: window.innerWidth <= 768 ? 0 : "auto",
    right: window.innerWidth <= 768 ? 0 : "auto",
    backgroundColor:
      window.innerWidth <= 768 ? "rgba(102, 126, 234, 0.98)" : "transparent",
    padding: window.innerWidth <= 768 ? "1.5rem" : "0",
    boxShadow:
      window.innerWidth <= 768 ? "0 8px 20px rgba(0, 0, 0, 0.2)" : "none",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexDirection: window.innerWidth <= 768 ? "column" : "row",
    padding: window.innerWidth <= 768 ? "1rem 0" : "0",
  },
  userName: {
    fontWeight: "600",
    whiteSpace: "nowrap",
    fontSize: "1rem",
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    backdropFilter: "blur(5px)",
  },
  logoutBtn: {
    background: "linear-gradient(135deg, #ea4335 0%, #d33425 100%)",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    fontSize: "1rem",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(234, 67, 53, 0.4)",
  },
  mobileMenuButton: {
    display: window.innerWidth <= 768 ? "block" : "none",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    cursor: "pointer",
    fontSize: "1.5rem",
    padding: "0.5rem",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    backdropFilter: "blur(5px)",
  },
};
