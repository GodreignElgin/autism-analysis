**Autism Detection Platform**  
**Technical Documentation**  
**Version:** 1.0  
**Date:** April 16, 2026  

---

### 1. Project Ideology

The Autism Detection Platform is an intelligent, non-invasive AI system designed to support early identification of autism spectrum traits. It empowers caregivers, clinicians, and individuals by combining advanced computer vision with behavioral pattern analysis to deliver fast, objective, and accessible insights.  

The core ideology is **holistic and human-centered**: no single signal defines autism. By intelligently fusing visual cues from facial imagery with real-world behavioral indicators, the platform provides a more balanced, accurate, and respectful assessment — reducing reliance on subjective observation alone and enabling earlier, more informed support decisions.

---

### 2. Ensemble Approach

The platform uses a **weighted ensemble** of two complementary AI models for superior accuracy and robustness:

- **Image Model**: Analyzes facial features and expressions using computer vision techniques (OpenCV, dlib, and deep learning-based inference).
- **Tabular Model**: Processes structured behavioral data (e.g., time spent alone, social event attendance, friends circle size, etc.) using a pre-trained gradient-boosted model (`best_model.pkl`).

**How the ensemble works**:
- Both models generate independent probability scores (0.0 – 1.0) for autism likelihood.
- The final autism likelihood score is computed as a **weighted average**:
  ```
  final_score = (image_score × IMAGE_MODEL_WEIGHT) + (tabular_score × TABULAR_MODEL_WEIGHT)
  ```
- Weights are fully configurable in the `.env` file (default: 0.7 for image model, 0.3 for tabular model).
- **Status logic**:
  - If no behavioral data is provided → **"Insufficient Information"** (clear message shown).
  - If behavioral data is provided → strict binary outcome: **"Yes"** (score ≥ 0.5) or **"No"** (score < 0.5).
- The system gracefully falls back to image-only mode if the tabular model is unavailable.
- All ensemble details (weights, individual scores, fallback reason) are returned in the API response and displayed transparently in the UI for debugging and trust.

This ensemble design ensures the platform remains functional even with partial input while delivering higher confidence when both modalities are available.

---

### 3. Setup and Run Instructions (New Machine)

These instructions are written for a **fresh Windows machine**. Mac instructions are included as short notes where they differ.

#### Prerequisites (Install Once)

**Windows:**
1. Install **Git** → https://git-scm.com/download/win (use default options).
2. Install **Node.js** (LTS version, currently v20 or v22) → https://nodejs.org (include “Add to PATH”).
3. Install **uv** (Python package manager) – easiest method:
   - Open **PowerShell** as Administrator and run:
     ```powershell
     powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
     ```

**Mac (optional):**
- Use Homebrew:
  ```bash
  brew install git node uv
  ```

#### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url> autism-detection
   cd autism-detection
   ```

2. **Backend Setup (Python + uv)**

   a. Go to backend folder:
      ```bash
      cd backend
      ```

   b. Install Python 3.11 automatically via uv:
      ```bash
      uv python install 3.11
      ```

   c. Create `.env` file from the example:
      ```bash
      copy .env.example .env
      ```

   d. Place your trained model file:
      - Copy `best_model.pkl` into the folder: `backend/ml_model/best_model.pkl`
      - (Create the `ml_model` folder if it does not exist.)

   e. Install dependencies (uv only – no pip needed):
      ```bash
      uv sync --extra tabular
      ```

3. **Frontend Setup (React)**

   a. Open a **new terminal** (or new PowerShell window) and go to frontend:
      ```bash
      cd ..\frontend
      ```

   b. Install Node packages:
      ```bash
      npm install
      ```

#### How to Run the Application

**Option A – Recommended (Development Mode)**

1. **Start Backend** (in its terminal window):
   ```bash
   cd backend
   uv run python app.py
   ```
   You should see the Flask server running on `http://127.0.0.1:5000`

2. **Start Frontend** (in second terminal window):
   ```bash
   cd frontend
   npm run dev
   ```
   The React app will open automatically in your browser (usually `http://localhost:5173` or similar).

**Option B – Production Build (Frontend only)**

If you want to serve the frontend as static files:
```bash
cd frontend
npm run build
```
Then you can serve the `dist` folder with any static server, or keep using `npm run dev` for development.

#### Verification Checklist (After First Run)

- Backend terminal shows: “Flask development server is running”
- Frontend opens in browser
- Go to **Analysis** page
- Upload an image + fill behavioral fields → click **Analyze**
- You should see the loading screen, then results with ensemble details
- Check backend terminal for clean logs (image model, behavioral payload, ensemble score)

#### Common Troubleshooting (Windows)

- “uv command not found” → Close and reopen PowerShell, or run `refreshenv` in PowerShell.
- Port 5000 already in use → Change `PORT` in backend `.env` or kill the process.
- Model loading error → Double-check that `best_model.pkl` is exactly at `backend/model/best_model.pkl`.

---

**You are now ready to use the Autism Detection Platform.**

The entire setup uses modern, reproducible tools (`uv` for Python, npm for frontend) and requires no manual virtual environments or conflicting package managers.

For any questions or further enhancements, refer back to this document or contact the development team.

**Document End.**