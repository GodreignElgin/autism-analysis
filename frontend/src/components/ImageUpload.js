import React, { useState } from "react";

function ImageUpload({ onAnalyze, loading }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (preview) {
      onAnalyze(preview);
    }
  };

  return (
    <div className="image-upload">
      <div className="upload-area">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
          id="image-input"
        />
        <label htmlFor="image-input" className="upload-label">
          {preview ? "📸 Change Image" : "📤 Click to Upload Image"}
        </label>
      </div>

      {preview && (
        <div className="preview-section">
          <img src={preview} alt="Preview" className="image-preview" />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="analyze-button"
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
