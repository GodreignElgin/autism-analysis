import React, { useState, useEffect, useContext, useRef } from "react";
import AuthContext from "../context/AuthContext";
import { FaPaperPlane } from "react-icons/fa";

export default function ChatPage() {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/chat/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages);
        }
      } catch (err) {
        setError("Failed to load chat history: " + err.message);
      }
    };

    fetchChatHistory();
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages([
          ...messages,
          {
            id: Date.now(),
            message: input,
            response: data.response,
            timestamp: data.timestamp,
          },
        ]);
        setInput("");
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Error sending message: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are the early signs of autism?",
    "How can I support my child better?",
    "What therapies are available?",
    "When should I seek professional help?",
    "How does early intervention help?",
  ];

  const handleSuggestedQuestion = async (question) => {
    setInput(question);
    // Auto-submit
    setTimeout(() => {
      const form = document.getElementById("chatForm");
      if (form) form.dispatchEvent(new Event("submit", { bubbles: true }));
    }, 100);
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatWrapper}>
        <div style={styles.header}>
          <h1>💬 Autism Support Chatbot</h1>
          <p>Get guidance and advice about autism and child development</p>
        </div>

        {error && <div style={styles.alert}>{error}</div>}

        <div style={styles.chatContainer}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <h2>Welcome to our Autism Support Chatbot</h2>
              <p>
                Ask any questions about autism, diagnosis, or supporting your
                child
              </p>

              <div style={styles.suggestedQuestions}>
                <h3>Suggested Questions:</h3>
                <div style={styles.suggestedGrid}>
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedQuestion(question)}
                      style={styles.suggestedButton}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.messagesList}>
              {messages.map((msg) => (
                <div key={msg.id} style={styles.messageGroup}>
                  <div style={{ ...styles.message, ...styles.userMessage }}>
                    <p>{msg.message}</p>
                    <span style={styles.timestamp}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ ...styles.message, ...styles.botMessage }}>
                    <p>{msg.response}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form
          id="chatForm"
          onSubmit={handleSendMessage}
          style={styles.inputArea}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            style={styles.input}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={styles.sendButton}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>

      {/* Sidebar with Info */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarCard}>
          <h3>💡 About This Chatbot</h3>
          <p>
            Our AI chatbot provides information and guidance about autism
            spectrum disorder, early detection, and parenting strategies.
          </p>
        </div>

        <div style={styles.sidebarCard}>
          <h3>📚 Topics Covered</h3>
          <ul style={styles.sidebarList}>
            <li>Autism spectrum characteristics</li>
            <li>Early detection signs</li>
            <li>Intervention strategies</li>
            <li>Therapy options</li>
            <li>Educational support</li>
            <li>Parenting tips</li>
          </ul>
        </div>

        <div style={styles.sidebarCard}>
          <h3>⚠️ Important Note</h3>
          <p>
            This chatbot provides general information only and is not a
            substitute for professional medical or psychological advice. Always
            consult with qualified healthcare professionals.
          </p>
        </div>

        <div style={styles.sidebarCard}>
          <h3>📞 Emergency Resources</h3>
          <p>
            <strong>Crisis Hotline:</strong> 1-800-AUTISM-1
          </p>
          <p>
            <strong>Emergency:</strong> 911
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "80vh",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr",
    },
  },
  chatWrapper: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  header: {
    padding: "20px",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderBottom: "1px solid #ecf0f1",
  },
  alert: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "12px 20px",
    borderBottom: "1px solid #f5c6cb",
  },
  chatContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    backgroundColor: "#f8f9fa",
  },
  messagesList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  messageGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  message: {
    padding: "12px 16px",
    borderRadius: "8px",
    maxWidth: "70%",
    wordWrap: "break-word",
  },
  userMessage: {
    backgroundColor: "#667eea",
    color: "white",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "white",
    color: "#2c3e50",
    border: "1px solid #ecf0f1",
    alignSelf: "flex-start",
  },
  timestamp: {
    fontSize: "0.75rem",
    opacity: 0.7,
    marginTop: "5px",
    display: "block",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#7f8c8d",
  },
  suggestedQuestions: {
    marginTop: "30px",
  },
  suggestedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    marginTop: "15px",
  },
  suggestedButton: {
    backgroundColor: "#f0f4ff",
    color: "#667eea",
    border: "1px solid #667eea",
    padding: "12px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  inputArea: {
    display: "flex",
    gap: "10px",
    padding: "15px 20px",
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #ecf0f1",
  },
  input: {
    flex: 1,
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  sendButton: {
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  sidebarCard: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  sidebarList: {
    listStyle: "none",
    padding: 0,
    margin: "10px 0 0 0",
  },
};
