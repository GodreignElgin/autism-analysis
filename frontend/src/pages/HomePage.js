import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { FaLightbulb, FaHeart, FaUsers, FaArrowRight } from "react-icons/fa";
import "./HomePage.css";

export default function HomePage() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero carousel slides with high-quality images
  const heroSlides = [
    {
      title: "AI-Powered Early Detection",
      subtitle:
        "Advanced machine learning combines facial signals and behavioral inputs to identify potential autism spectrum characteristics in children.",
      image:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
      alt: "Medical technology and child healthcare",
    },
    {
      title: "Supporting Children & Families",
      subtitle:
        "Empowering parents with early insights and professional guidance for better developmental outcomes.",
      image:
        "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80",
      alt: "Parent and child interaction",
    },
    {
      title: "Comprehensive Analysis Dashboard",
      subtitle:
        "Track progress over time with detailed reports, insights, and personalized recommendations.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      alt: "Healthcare analytics and monitoring",
    },
    {
      title: "24/7 AI Assistant Support",
      subtitle:
        "Get instant answers and guidance from our intelligent chatbot trained by autism specialists.",
      image:
        "https://www.shutterstock.com/shutterstock/photos/2675075517/display_1500/2675075517.jpg",
      alt: "Medical professional providing support",
    },
  ];

  useEffect(() => {
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all animatable elements
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div style={styles.container}>
      {/* Hero Section with Carousel */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1
            style={{ ...styles.heroTitle, animation: "fadeInUp 0.8s ease-out" }}
            key={`title-${currentSlide}`}
          >
            {heroSlides[currentSlide].title}
          </h1>
          <p
            style={{
              ...styles.heroSubtitle,
              animation: "fadeInUp 0.8s ease-out 0.2s",
              animationFillMode: "both",
            }}
            key={`subtitle-${currentSlide}`}
          >
            {heroSlides[currentSlide].subtitle}
          </p>
          <div style={styles.heroCTA}>
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/analyze")}
                style={styles.ctaPrimary}
              >
                Start Analysis <FaArrowRight style={{ marginLeft: "0.5rem" }} />
              </button>
            ) : (
              <>
                <Link to="/register" style={styles.ctaPrimary}>
                  Get Started <FaArrowRight style={{ marginLeft: "0.5rem" }} />
                </Link>
                <Link to="/analyze" style={styles.ctaSecondary}>
                  Quick Analysis
                </Link>
              </>
            )}
          </div>

          {/* Carousel indicators */}
          <div style={styles.carouselIndicators}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  ...styles.indicator,
                  backgroundColor:
                    index === currentSlide
                      ? "white"
                      : "rgba(255, 255, 255, 0.4)",
                  transform: index === currentSlide ? "scale(1.2)" : "scale(1)",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div style={styles.heroImage}>
          <div
            style={{
              ...styles.heroImageContainer,
              animation: "fadeIn 1s ease-out",
            }}
            key={`image-${currentSlide}`}
          >
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].alt}
              style={styles.heroImg}
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div className="container">
          <div style={styles.statsGrid}>
            <div
              style={styles.statCard}
              className="animate-on-scroll"
              data-delay="0"
            >
              <div style={styles.statNumber}>98%</div>
              <div style={styles.statLabel}>Accuracy Rate</div>
            </div>
            <div
              style={styles.statCard}
              className="animate-on-scroll"
              data-delay="100"
            >
              <div style={styles.statNumber}>10K+</div>
              <div style={styles.statLabel}>Families Helped</div>
            </div>
            <div
              style={styles.statCard}
              className="animate-on-scroll"
              data-delay="200"
            >
              <div style={styles.statNumber}>24/7</div>
              <div style={styles.statLabel}>AI Support</div>
            </div>
            <div
              style={styles.statCard}
              className="animate-on-scroll"
              data-delay="300"
            >
              <div style={styles.statNumber}>50K+</div>
              <div style={styles.statLabel}>Analyses Done</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={styles.section}>
        <div className="container">
          <h2 style={styles.sectionTitle} className="animate-on-scroll">
            What is Autism Spectrum Disorder?
          </h2>
          <div style={styles.aboutGrid}>
            <div
              style={styles.aboutCard}
              className="animate-on-scroll"
              data-delay="0"
            >
              <FaUsers style={styles.aboutIcon} />
              <h3>Social Communication</h3>
              <p>
                Autism affects how children communicate and interact with
                others. Early intervention can help develop these skills
                significantly.
              </p>
            </div>
            <div
              style={styles.aboutCard}
              className="animate-on-scroll"
              data-delay="100"
            >
              <FaHeart style={styles.aboutIcon} />
              <h3>Behavioral Patterns</h3>
              <p>
                Children with autism may show different behavioral patterns
                including repetitive interests and sensory sensitivities.
              </p>
            </div>
            <div
              style={styles.aboutCard}
              className="animate-on-scroll"
              data-delay="200"
            >
              <FaLightbulb style={styles.aboutIcon} />
              <h3>Early Support</h3>
              <p>
                Research shows that early diagnosis and intervention lead to
                better outcomes and improved quality of life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Platform Section */}
      <section style={styles.sectionAlt}>
        <div className="container">
          <h2 style={styles.sectionTitle} className="animate-on-scroll">
            How Our Platform Works
          </h2>
          <div style={styles.stepsGrid}>
            <div
              style={styles.step}
              className="animate-on-scroll"
              data-delay="0"
            >
              <div style={styles.stepNumber}>1</div>
              <h3>Upload Photo</h3>
              <p>Upload a clear photo of the child's face for analysis</p>
            </div>
            <div
              style={styles.step}
              className="animate-on-scroll"
              data-delay="100"
            >
              <div style={styles.stepNumber}>2</div>
              <h3>Add Behavioral Inputs</h3>
              <p>Provide structured social and behavior details</p>
            </div>
            <div
              style={styles.step}
              className="animate-on-scroll"
              data-delay="200"
            >
              <div style={styles.stepNumber}>3</div>
              <h3>Ensemble Scoring</h3>
              <p>Weighted image + tabular models produce final score</p>
            </div>
            <div
              style={styles.step}
              className="animate-on-scroll"
              data-delay="300"
            >
              <div style={styles.stepNumber}>4</div>
              <h3>Get Results</h3>
              <p>Receive detailed analysis with recommendations</p>
            </div>
            <div
              style={styles.step}
              className="animate-on-scroll"
              data-delay="350"
            >
              <div style={styles.stepNumber}>5</div>
              <h3>Track Progress</h3>
              <p>
                Save results and monitor progress over time with our dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.section}>
        <div className="container">
          <h2 style={styles.sectionTitle} className="animate-on-scroll">
            Key Features
          </h2>
          <div style={styles.featuresGrid}>
            <div
              style={styles.featureCard}
              className="animate-on-scroll"
              data-delay="0"
            >
              <h3>🎯 Accurate Analysis</h3>
              <p>
                Using advanced deep learning CNN model trained on diverse
                datasets
              </p>
            </div>
            <div
              style={styles.featureCard}
              className="animate-on-scroll"
              data-delay="50"
            >
              <h3>👨‍👩‍👧 Parent Dashboard</h3>
              <p>Track your child's assessments and progress over time</p>
            </div>
            <div
              style={styles.featureCard}
              className="animate-on-scroll"
              data-delay="100"
            >
              <h3>🤖 AI Chatbot</h3>
              <p>Get expert guidance and advice on supporting your child</p>
            </div>
            <div
              style={styles.featureCard}
              className="animate-on-scroll"
              data-delay="150"
            >
              <h3>📊 Detailed Reports</h3>
              <p>Comprehensive image + behavioral analysis with recommendations</p>
            </div>
            <div
              style={styles.featureCard}
              className="animate-on-scroll"
              data-delay="200"
            >
              <h3>🔒 Secure & Private</h3>
              <p>
                Your data is protected with encryption and strict privacy
                policies
              </p>
            </div>
            <div
              style={styles.featureCard}
              className="animate-on-scroll"
              data-delay="250"
            >
              <h3>💬 Professional Support</h3>
              <p>Connect with professionals and other parents for guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section style={styles.ctaSection}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of parents who are using our platform for early
              autism detection
            </p>
            <div style={styles.ctaButtons}>
              <Link to="/register" style={styles.ctaPrimary}>
                Create Account
              </Link>
              <Link to="/analyze" style={styles.ctaSecondary}>
                Try Quick Analysis
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section style={styles.sectionAlt}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div style={styles.faqGrid}>
            <div style={styles.faqItem}>
              <h4>Is this a diagnostic tool?</h4>
              <p>
                No, this is a screening tool for initial assessment. Always
                consult with healthcare professionals for proper diagnosis.
              </p>
            </div>
            <div style={styles.faqItem}>
              <h4>How accurate is the analysis?</h4>
              <p>
                Our model is trained on thousands of images and achieves high
                accuracy. However, professional evaluation is always
                recommended.
              </p>
            </div>
            <div style={styles.faqItem}>
              <h4>What age group can be analyzed?</h4>
              <p>
                Our model works best for children ages 2-12, though it can be
                used for other ages.
              </p>
            </div>
            <div style={styles.faqItem}>
              <h4>How long does analysis take?</h4>
              <p>
                The analysis typically completes in a few seconds after submitting image and behavioral data.
              </p>
            </div>
            <div style={styles.faqItem}>
              <h4>Is my data secure?</h4>
              <p>
                Yes, all data is encrypted and stored securely. We comply with
                HIPAA and GDPR regulations.
              </p>
            </div>
            <div style={styles.faqItem}>
              <h4>Do I need to create an account?</h4>
              <p>
                You can do a quick analysis without an account, but need one to
                save results and track progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
  },
  hero: {
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "60px 20px",
    display: "flex",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap",
  },
  heroContent: {
    flex: 1,
    minWidth: "300px",
  },
  heroTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    lineHeight: "1.2",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    marginBottom: "30px",
    opacity: 0.95,
    lineHeight: "1.8",
  },
  heroCTA: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  heroImage: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImageContainer: {
    width: "100%",
    maxWidth: "550px",
    height: "auto",
    position: "relative",
    overflow: "hidden",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  heroImg: {
    width: "100%",
    height: "400px",
    objectFit: "cover",
    borderRadius: "20px",
    transition: "transform 0.5s ease",
  },
  carouselIndicators: {
    display: "flex",
    gap: "12px",
    marginTop: "30px",
    justifyContent: "center",
  },
  indicator: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "2px solid white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    padding: 0,
    outline: "none",
  },
  section: {
    padding: "60px 20px",
    backgroundColor: "white",
  },
  sectionAlt: {
    padding: "60px 20px",
    backgroundColor: "#f8f9fa",
  },
  sectionTitle: {
    fontSize: "2rem",
    textAlign: "center",
    marginBottom: "40px",
    color: "#2c3e50",
    fontWeight: "bold",
  },
  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },
  aboutCard: {
    backgroundColor: "#f0f4ff",
    padding: "35px",
    borderRadius: "16px",
    textAlign: "center",
    transition: "transform 0.3s",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.1)",
  },
  aboutIcon: {
    fontSize: "3rem",
    color: "#667eea",
    marginBottom: "15px",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
  },
  step: {
    textAlign: "center",
    padding: "25px",
  },
  stepNumber: {
    backgroundColor: "#667eea",
    color: "white",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0 auto 20px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },
  featureCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.3s",
    border: "1px solid rgba(102, 126, 234, 0.1)",
  },
  ctaSection: {
    padding: "60px 20px",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    textAlign: "center",
  },
  ctaButtons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "25px",
  },
  ctaPrimary: {
    backgroundColor: "white",
    color: "#667eea",
    padding: "14px 32px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "transform 0.3s",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  ctaSecondary: {
    backgroundColor: "transparent",
    color: "white",
    padding: "14px 32px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    border: "2px solid white",
    transition: "all 0.3s",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    backdropFilter: "blur(5px)",
  },
  faqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },
  faqItem: {
    backgroundColor: "white",
    padding: "28px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid rgba(102, 126, 234, 0.08)",
    transition: "all 0.3s ease",
  },
  statsSection: {
    padding: "60px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  statCard: {
    textAlign: "center",
    padding: "25px",
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.3s ease",
  },
  statNumber: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "10px",
    background:
      "linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  statLabel: {
    fontSize: "1rem",
    opacity: 0.95,
    fontWeight: "500",
  },
};
