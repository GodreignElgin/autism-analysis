# 📄 Requirement Document: Local Inference Setup for Autism Prediction Model

## 1. Objective
Build a local execution environment to run a pre-trained machine learning model (`best_model.pkl`) for predicting personality/autism-related traits based on behavioral inputs.

The system should:
- Load a serialized model
- Accept structured input data
- Perform inference
- Output prediction and optional probabilities

---

## 2. Scope
This document defines requirements for:
- Local development setup
- Dependency management
- Inference pipeline
- Error handling

Out of scope:
- Model training
- UI/frontend
- Deployment to cloud

---

## 3. Project Structure

```
autism_model_test/
│
├── model/
│   └── best_model.pkl
│
├── src/
│   └── inference.py
│
├── requirements.txt
└── README.md
```

---

## 4. Dependencies

### Required Libraries
- pandas
- numpy
- scikit-learn
- joblib
- catboost
- xgboost
- lightgbm

### requirements.txt
```
pandas
numpy
scikit-learn
joblib
catboost
xgboost
lightgbm
```

---

## 5. Environment Setup

### Steps
1. Install Python 3.10+
2. Create virtual environment
3. Activate environment
4. Install dependencies

### Commands
```
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

---

## 6. Model Details

- File: `best_model.pkl`
- Type: Serialized sklearn pipeline (includes preprocessing + model)
- Expected Input Type: pandas DataFrame

### Input Features

#### Numerical Features
- Time_spent_Alone
- Social_event_attendance
- Going_outside
- Friends_circle_size
- Post_frequency

#### Categorical Features
- Stage_fear (Yes/No)
- Drained_after_socializing (Yes/No)

---

## 7. Functional Requirements

### FR1: Model Loading
- Load model from `model/best_model.pkl`
- Raise error if file not found

### FR2: Input Handling
- Accept input as Python dictionary
- Convert input to pandas DataFrame

### FR3: Prediction
- Perform prediction using `model.predict()`
- Return prediction output

### FR4: Probability Output (Optional)
- If model supports `predict_proba`, return probabilities

### FR5: Logging
- Print model load status
- Print prediction results

---

## 8. Non-Functional Requirements

### NFR1: Compatibility
- Must work on Windows, Linux, Mac

### NFR2: Reliability
- Handle missing model file gracefully

### NFR3: Maintainability
- Modular code structure
- Clear separation of concerns

---

## 9. Error Handling

| Scenario | Expected Behavior |
|---------|-----------------|
| Model file missing | Raise FileNotFoundError |
| Missing dependency | Prompt installation |
| Feature mismatch | Raise ValueError |

---

## 10. Inference Logic

### Steps
1. Load model
2. Prepare input dictionary
3. Convert to DataFrame
4. Call model.predict()
5. Return result

---

## 11. Sample Input

```
{
  "Time_spent_Alone": 6,
  "Social_event_attendance": 1,
  "Going_outside": 2,
  "Friends_circle_size": 3,
  "Post_frequency": 0,
  "Stage_fear": "Yes",
  "Drained_after_socializing": "Yes"
}
```

---

## 12. Execution

Run the script:
```
python src/inference.py
```

---

## 13. Future Enhancements

- Convert to FastAPI service
- Add Streamlit UI
- Integrate with facial recognition model
- Add batch prediction support

---

## 14. Success Criteria

- Model loads successfully
- Prediction runs without error
- Output is generated correctly

---

## 15. Notes for AI-Powered IDEs

- Assume model is a sklearn Pipeline
- Do NOT apply preprocessing manually
- Always pass pandas DataFrame as input
- Ensure categorical values match training format

---

End of Document

