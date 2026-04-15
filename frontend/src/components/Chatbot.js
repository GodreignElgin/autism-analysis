import React, { useState, useEffect, useContext, useRef } from "react";
import AuthContext from "../context/AuthContext";
import { FaPaperPlane, FaTimes, FaMinus } from "react-icons/fa";
import "./Chatbot.css";

export default function Chatbot() {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What are the early signs of autism?",
    "How can I support my child?",
    "What therapies are available?",
    "When should I seek help?",
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([
        {
          id: 0,
          message: "",
          response:
            "Hello! I'm here to help you with questions about autism spectrum disorder, early detection, and parenting strategies. How can I assist you today?",
          timestamp: new Date().toISOString(),
          isWelcome: true,
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isAuthenticated) {
      setError("Please log in to use the chatbot");
      return;
    }

    const userMessage = input;
    setInput("");
    setLoading(true);
    setError("");

    // Add user message immediately
    const tempUserMsg = {
      id: Date.now(),
      message: userMessage,
      response: "",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempUserMsg.id
              ? { ...msg, response: data.response }
              : msg
          )
        );
      } else {
        setError(data.error || "Failed to send message");
        setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMsg.id));
      }
    } catch (err) {
      setError("Error sending message: " + err.message);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggested questions from API on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/chat/suggestions"
        );
        const data = await response.json();
        if (response.ok && data.suggestions) {
          // Get first 4 suggestions for display
          setSuggestedQuestions(
            data.suggestions.slice(0, 4).map((s) => s.question)
          );
        }
      } catch (error) {
        console.log("Using default suggestions");
        // Keep default questions if API fails
      }
    };

    fetchSuggestions();
  }, []);

  const handleSuggestedQuestion = (question) => {
    setInput(question);
  };

  const RobotIcon = () => (
    <svg
      width="36"
      height="36"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
    >
      <defs>
        <linearGradient id="robotGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#f0f4ff", stopOpacity: 1 }}
          />
        </linearGradient>
        <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#764ba2", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#667eea", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>

      {/* Antenna */}
      <line
        x1="50"
        y1="15"
        x2="50"
        y2="28"
        stroke="url(#eyeGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="50" cy="12" r="5" fill="url(#eyeGradient)" />
      <circle cx="50" cy="12" r="2.5" fill="white" opacity="0.6" />

      {/* Head */}
      <rect
        x="25"
        y="28"
        width="50"
        height="42"
        rx="8"
        fill="url(#robotGradient)"
        stroke="#667eea"
        strokeWidth="2"
      />

      {/* Eyes */}
      <circle cx="38" cy="45" r="6" fill="url(#eyeGradient)" />
      <circle cx="38" cy="43" r="2" fill="white" opacity="0.8" />
      <circle cx="62" cy="45" r="6" fill="url(#eyeGradient)" />
      <circle cx="62" cy="43" r="2" fill="white" opacity="0.8" />

      {/* Smile */}
      <path
        d="M 35 58 Q 50 65 65 58"
        stroke="#667eea"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Body panel */}
      <rect
        x="30"
        y="62"
        width="10"
        height="6"
        rx="2"
        fill="#667eea"
        opacity="0.6"
      />
      <rect
        x="60"
        y="62"
        width="10"
        height="6"
        rx="2"
        fill="#667eea"
        opacity="0.6"
      />
      <circle cx="50" cy="65" r="3" fill="#667eea" opacity="0.4" />

      {/* Arms suggestion */}
      <rect
        x="18"
        y="50"
        width="5"
        height="15"
        rx="2.5"
        fill="#667eea"
        opacity="0.3"
      />
      <rect
        x="77"
        y="50"
        width="5"
        height="15"
        rx="2.5"
        fill="#667eea"
        opacity="0.3"
      />
    </svg>
  );

  const BadgeIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={styles.badgeIcon}
    >
      <path
        d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
        fill="white"
      />
      <circle cx="8" cy="10" r="1.5" fill="#667eea" />
      <circle cx="12" cy="10" r="1.5" fill="#667eea" />
      <circle cx="16" cy="10" r="1.5" fill="#667eea" />
    </svg>
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={styles.floatingButton}
        className="chatbot-button"
      >
        <RobotIcon />
        <div style={styles.badge}>
          <BadgeIcon />
        </div>
      </button>
    );
  }

  return (
    <div
      style={isMinimized ? styles.minimizedContainer : styles.chatbotContainer}
    >
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="50"
              y1="15"
              x2="50"
              y2="28"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="50" cy="12" r="5" fill="white" />
            <circle cx="50" cy="12" r="2.5" fill="rgba(255,255,255,0.4)" />
            <rect
              x="25"
              y="28"
              width="50"
              height="42"
              rx="8"
              fill="white"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
            <circle cx="38" cy="45" r="6" fill="rgba(255,255,255,0.3)" />
            <circle cx="38" cy="43" r="2" fill="white" />
            <circle cx="62" cy="45" r="6" fill="rgba(255,255,255,0.3)" />
            <circle cx="62" cy="43" r="2" fill="white" />
            <path
              d="M 35 58 Q 50 65 65 58"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <rect
              x="30"
              y="62"
              width="10"
              height="6"
              rx="2"
              fill="rgba(255,255,255,0.4)"
            />
            <rect
              x="60"
              y="62"
              width="10"
              height="6"
              rx="2"
              fill="rgba(255,255,255,0.4)"
            />
          </svg>
          <span style={styles.headerTitle}>AI Assistant</span>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={styles.iconButton}
            className="icon-button"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <FaMinus size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={styles.iconButton}
            className="icon-button"
            title="Close"
          >
            <FaTimes size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <div style={styles.messagesContainer} className="messages-container">
            {messages.length === 1 && messages[0].isWelcome ? (
              <div style={styles.welcomeContainer}>
                <div style={{ ...styles.message, ...styles.botMessage }}>
                  <p>{messages[0].response}</p>
                </div>
                <div style={styles.suggestedQuestions}>
                  <p style={styles.suggestedTitle}>Quick questions:</p>
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedQuestion(question)}
                      style={styles.suggestedButton}
                      className="suggested-button"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.messagesList}>
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.message && (
                      <div
                        style={{ ...styles.message, ...styles.userMessage }}
                        className="user-message"
                      >
                        <p>{msg.message}</p>
                      </div>
                    )}
                    {msg.response && (
                      <div
                        style={{ ...styles.message, ...styles.botMessage }}
                        className="bot-message"
                      >
                        <p>{msg.response}</p>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div style={{ ...styles.message, ...styles.botMessage }}>
                    <div
                      style={styles.typingIndicator}
                      className="typing-indicator"
                    >
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} style={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder={
                isAuthenticated
                  ? "Type your question..."
                  : "Please log in to chat"
              }
              style={styles.input}
              disabled={loading || !isAuthenticated}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !isAuthenticated}
              style={styles.sendButton}
              className="send-button"
            >
              <FaPaperPlane />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

const styles = {
  floatingButton: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    boxShadow:
      "0 6px 20px rgba(102, 126, 234, 0.45), 0 0 0 0 rgba(102, 126, 234, 0.4)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
    color: "white",
    padding: "6px",
    borderRadius: "50%",
    boxShadow: "0 2px 8px rgba(255, 107, 107, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIcon: {
    display: "block",
  },
  chatbotContainer: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "400px",
    height: "600px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.18), 0 0 1px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
    overflow: "hidden",
    border: "1px solid rgba(102, 126, 234, 0.1)",
  },
  minimizedContainer: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "320px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.18), 0 0 1px rgba(0,0,0,0.1)",
    zIndex: 1000,
    overflow: "hidden",
    border: "1px solid rgba(102, 126, 234, 0.1)",
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerTitle: {
    fontWeight: "600",
    fontSize: "16px",
  },
  headerActions: {
    display: "flex",
    gap: "8px",
  },
  iconButton: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  errorBanner: {
    backgroundColor: "#fee",
    color: "#c33",
    padding: "10px",
    fontSize: "13px",
    borderBottom: "1px solid #fdd",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    backgroundColor: "#f8f9fa",
  },
  messagesList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  message: {
    padding: "12px 16px",
    borderRadius: "16px",
    maxWidth: "80%",
    wordWrap: "break-word",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "8px",
  },
  userMessage: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    alignSelf: "flex-end",
    marginLeft: "auto",
    borderBottomRightRadius: "6px",
    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.25)",
  },
  botMessage: {
    backgroundColor: "white",
    color: "#2c3e50",
    border: "1px solid #e8ecf1",
    alignSelf: "flex-start",
    borderBottomLeftRadius: "6px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  },
  welcomeContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  suggestedQuestions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  suggestedTitle: {
    fontSize: "13px",
    color: "#666",
    fontWeight: "600",
    margin: "0 0 5px 0",
  },
  suggestedButton: {
    backgroundColor: "#f5f8ff",
    color: "#667eea",
    border: "1.5px solid #d0dcf7",
    padding: "12px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left",
    transition: "all 0.2s ease",
    fontWeight: "500",
  },
  inputForm: {
    display: "flex",
    gap: "8px",
    padding: "12px",
    backgroundColor: "white",
    borderTop: "1px solid #e1e8ed",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "2px solid #e8ecf1",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s ease",
    backgroundColor: "#fafbfc",
  },
  sendButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.25)",
  },
  typingIndicator: {
    display: "flex",
    gap: "4px",
    padding: "5px 0",
  },
};
