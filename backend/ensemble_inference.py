import json
import os
from typing import Dict, Optional, Tuple

try:
    import joblib
    import pandas as pd
except ImportError:
    joblib = None
    pd = None


def _install_sklearn_pickle_compat_shims() -> None:
    """
    Install compatibility shims for sklearn private classes that may be referenced
    by older pickled pipelines (e.g., from Colab/Kaggle environments).
    """
    try:
        from sklearn.compose import _column_transformer
    except Exception:
        return

    if not hasattr(_column_transformer, "_RemainderColsList"):
        class _RemainderColsList(list):
            """Compatibility shim for older sklearn pickles."""

        _column_transformer._RemainderColsList = _RemainderColsList


TABULAR_FEATURES = [
    "Time_spent_Alone",
    "Social_event_attendance",
    "Going_outside",
    "Friends_circle_size",
    "Post_frequency",
    "Stage_fear",
    "Drained_after_socializing",
]

NUMERICAL_FEATURES = {
    "Time_spent_Alone",
    "Social_event_attendance",
    "Going_outside",
    "Friends_circle_size",
    "Post_frequency",
}


class TabularBehaviorModel:
    def __init__(self, model_path: str):
        self.model_path = self._resolve_model_path(model_path)
        self.model = None
        self.is_ready = False
        self.last_error = ""
        self._load_model()

    def _resolve_model_path(self, model_path: str) -> str:
        if os.path.isabs(model_path):
            return model_path
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(project_root, model_path)

    def _load_model(self) -> None:
        if joblib is None or pd is None:
            self.last_error = "Tabular dependencies not installed. Run: uv sync --extra tabular"
            return
        if not os.path.exists(self.model_path):
            self.last_error = f"Tabular model not found at: {self.model_path}"
            return
        try:
            _install_sklearn_pickle_compat_shims()
            self.model = joblib.load(self.model_path)
            self.is_ready = True
            self.last_error = ""
            print(f"Tabular behavior model loaded from {self.model_path}")
        except Exception as exc:
            self.is_ready = False
            self.last_error = f"Failed to load tabular model: {exc}"

    def predict_score(self, behavioral_data: Dict) -> Tuple[float, Optional[Dict], Optional[str]]:
        if not self.is_ready:
            return 0.0, None, self.last_error or "Tabular model unavailable"
        try:
            normalized = _normalize_behavioral_data(behavioral_data)
            frame = pd.DataFrame([normalized], columns=TABULAR_FEATURES)
            if hasattr(self.model, "predict_proba"):
                proba = self.model.predict_proba(frame)[0]
                score = float(proba[1] if len(proba) > 1 else proba[0])
                return score, {"class_0": float(proba[0]), "class_1": float(score)}, None
            prediction = self.model.predict(frame)[0]
            score = float(prediction)
            score = max(0.0, min(1.0, score))
            return score, None, None
        except Exception as exc:
            return 0.0, None, str(exc)


def _normalize_behavioral_data(data: Dict) -> Dict:
    missing = [feature for feature in TABULAR_FEATURES if feature not in data]
    if missing:
        raise ValueError(f"Missing behavioral features: {', '.join(missing)}")

    normalized = {}
    for feature in TABULAR_FEATURES:
        value = data[feature]
        if feature in NUMERICAL_FEATURES:
            try:
                normalized[feature] = float(value)
            except (TypeError, ValueError) as exc:
                raise ValueError(f"Feature '{feature}' must be numeric") from exc
        else:
            normalized[feature] = str(value)

    return normalized


def extract_behavioral_input_from_request(req) -> Optional[Dict]:
    """
    Accept behavioral data in one of these forms:
    - multipart form field named `behavioral_data` containing JSON string
    - individual form fields matching TABULAR_FEATURES
    """
    behavioral_json = req.form.get("behavioral_data")
    if behavioral_json:
        try:
            parsed = json.loads(behavioral_json)
            if not isinstance(parsed, dict):
                raise ValueError("behavioral_data must be a JSON object")
            return parsed
        except json.JSONDecodeError as exc:
            raise ValueError("Invalid JSON in behavioral_data") from exc

    if all(feature in req.form for feature in TABULAR_FEATURES):
        return {feature: req.form.get(feature) for feature in TABULAR_FEATURES}

    return None


def compute_weighted_ensemble_score(
    image_score: float, tabular_score: float, image_weight: float, tabular_weight: float
) -> float:
    total = image_weight + tabular_weight
    if total <= 0:
        return float(image_score)
    normalized_image_weight = image_weight / total
    normalized_tabular_weight = tabular_weight / total
    score = (image_score * normalized_image_weight) + (tabular_score * normalized_tabular_weight)
    return float(max(0.0, min(1.0, score)))
