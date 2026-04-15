import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaHeart,
  FaInstagram,
} from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerWave}>
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={styles.waveSvg}
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>

      <div className="container" style={styles.footerContent}>
        <div style={styles.footerSection}>
          <div style={styles.logoSection}>
            <div style={styles.footerLogo}>
              <FaHeart style={styles.logoIcon} />
              <h3 style={styles.brandName}>Autism Detection</h3>
            </div>
            <p style={styles.tagline}>
              Empowering early intervention through AI-powered analysis
            </p>
          </div>
          <p style={styles.description}>
            We're dedicated to early autism detection using advanced machine
            learning to help families and healthcare professionals identify
            developmental signs early.
          </p>
          <div style={styles.socialLinks}>
            <a
              href="https://facebook.com"
              title="Facebook"
              style={styles.socialIcon}
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com"
              title="Twitter"
              style={styles.socialIcon}
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              title="Instagram"
              style={styles.socialIcon}
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        <div style={styles.footerSection}>
          <h3 style={styles.sectionTitle}>Quick Links</h3>
          <ul style={styles.footerLinks}>
            <li style={styles.linkItem}>
              <a href="/" style={styles.link}>
                Home
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/analyze" style={styles.link}>
                Start Analysis
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/dashboard" style={styles.link}>
                Dashboard
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/chat" style={styles.link}>
                AI Assistant
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="#faq" style={styles.link}>
                FAQs
              </a>
            </li>
          </ul>
        </div>

        <div style={styles.footerSection}>
          <h3 style={styles.sectionTitle}>Resources</h3>
          <ul style={styles.footerLinks}>
            <li style={styles.linkItem}>
              <a href="#about" style={styles.link}>
                About Autism
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="#research" style={styles.link}>
                Research & Studies
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="#privacy" style={styles.link}>
                Privacy Policy
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="#terms" style={styles.link}>
                Terms of Service
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="#support" style={styles.link}>
                Support Center
              </a>
            </li>
          </ul>
        </div>

        <div style={styles.footerSection}>
          <h3 style={styles.sectionTitle}>Contact Us</h3>
          <div style={styles.contactInfo}>
            <div style={styles.contactItem}>
              <FaEnvelope style={styles.contactIcon} />
              <a href="mailto:support@autismdetection.com" style={styles.link}>
                support@autismdetection.com
              </a>
            </div>
            <div style={styles.contactItem}>
              <FaPhone style={styles.contactIcon} />
              <span style={styles.contactText}>+91234567890</span>
            </div>
            <div style={styles.contactItem}>
              <FaMapMarkerAlt style={styles.contactIcon} />
              <span style={styles.contactText}>Karkala, Karnataka</span>
            </div>
          </div>

          <div style={styles.disclaimer}>
            <FaShieldAlt style={styles.disclaimerIcon} />
            <p style={styles.disclaimerText}>
              <strong>Medical Disclaimer:</strong> This screening tool is for
              informational purposes only. Always consult qualified healthcare
              professionals for diagnosis.
            </p>
          </div>
        </div>
      </div>

      <div style={styles.footerBottom}>
        <div className="container" style={styles.bottomContent}>
          <p style={styles.copyright}>
            &copy; 2025 Autism Detection Platform. All rights reserved.
          </p>
          <div style={styles.bottomLinks}>
            <a href="#privacy" style={styles.bottomLink}>
              Privacy
            </a>
            <span style={styles.separator}>•</span>
            <a href="#terms" style={styles.bottomLink}>
              Terms
            </a>
            <span style={styles.separator}>•</span>
            <a href="#cookies" style={styles.bottomLink}>
              Cookies
            </a>
            <span style={styles.separator}>•</span>
            <a href="#accessibility" style={styles.bottomLink}>
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    color: "#ecf0f1",
    position: "relative",
    marginTop: "4rem",
    overflow: "hidden",
  },
  footerWave: {
    position: "relative",
    width: "100%",
    height: "80px",
    color: "#667eea",
    opacity: 0.3,
  },
  waveSvg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  footerContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "3rem",
    padding: "3rem 2rem",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  footerSection: {
    padding: "0",
  },
  logoSection: {
    marginBottom: "1.5rem",
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.75rem",
  },
  logoIcon: {
    fontSize: "2rem",
    color: "#FF6B9D",
    animation: "pulse 2s ease-in-out infinite",
  },
  brandName: {
    fontSize: "1.5rem",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  tagline: {
    fontSize: "0.9rem",
    color: "#bdc3c7",
    fontStyle: "italic",
    marginBottom: "1rem",
  },
  description: {
    fontSize: "0.95rem",
    lineHeight: "1.7",
    color: "#bdc3c7",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    marginBottom: "1.25rem",
    color: "#fff",
    position: "relative",
    paddingBottom: "0.5rem",
  },
  footerLinks: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  linkItem: {
    marginBottom: "0.75rem",
  },
  link: {
    color: "#bdc3c7",
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    display: "inline-block",
    position: "relative",
  },
  socialLinks: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  socialIcon: {
    color: "#fff",
    fontSize: "1.5rem",
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    textDecoration: "none",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  contactInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  contactIcon: {
    color: "#667eea",
    fontSize: "1.1rem",
    minWidth: "20px",
  },
  contactText: {
    color: "#bdc3c7",
    fontSize: "0.95rem",
  },
  disclaimer: {
    backgroundColor: "rgba(255, 107, 157, 0.1)",
    border: "1px solid rgba(255, 107, 157, 0.3)",
    borderRadius: "12px",
    padding: "1rem",
    display: "flex",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },
  disclaimerIcon: {
    color: "#FF6B9D",
    fontSize: "1.5rem",
    minWidth: "24px",
    marginTop: "0.25rem",
  },
  disclaimerText: {
    fontSize: "0.85rem",
    lineHeight: "1.6",
    color: "#ecf0f1",
    margin: 0,
  },
  footerBottom: {
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "1.5rem 0",
    background: "rgba(0, 0, 0, 0.2)",
  },
  bottomContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    padding: "0 2rem",
  },
  copyright: {
    color: "#95a5a6",
    fontSize: "0.9rem",
    margin: 0,
  },
  bottomLinks: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  bottomLink: {
    color: "#95a5a6",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.3s ease",
  },
  separator: {
    color: "#95a5a6",
  },
};
