import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedModel, setSelectedModel] = useState('cnn');
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setPredictionData(null);
      setError(null);
    }
  };

  const handleModelChange = (mode) => {
    setSelectedModel(mode);
    setPredictionData(null);
  };

  const handleUpload = async (e) => {
  e.preventDefault();

  if (!file) {
    setError("Please select a satellite image first.");
    return;
  }

  setLoading(true);
  setError(null);


  const formData = new FormData();

  // MUST match FastAPI UploadFile name
  formData.append('file', file);


  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || 
    'https://darshan1622-deforestation-backend.hf.space';


  let endpoint = `${BACKEND_URL}/predict/cnn`;

  if (selectedModel === 'mobilenet') {
    endpoint = `${BACKEND_URL}/predict/mobilenet`;
  }

  else if (selectedModel === 'compare') {
    endpoint = `${BACKEND_URL}/predict/compare`;
  } 


  try {

    const response = await axios.post(
      endpoint,
      formData,
      {
        headers:{
          'Content-Type':'multipart/form-data'
        }
      }
    );


    setPredictionData(response.data);


  } catch(err){

    console.error(err);

    setError(
      "Failed to fetch prediction. Ensure backend server is running."
    );

  }
  finally{

    setLoading(false);

  }

};

  const RenderSingleResult = ({ data }) => (
    <div className="result-card">
      <div className="card-header">
        <h3>Model: <span className="highlight">{data.model}</span></h3>
      </div>
      <div className="card-body">
        <div className="metric-row primary-metric">
          <span className="label">Predicted Class</span>
          <span className="value">{data.predicted_class}</span>
        </div>
        <div className="metric-row">
          <span className="label">Confidence Score</span>
          <span className="value badge">{data.confidence}</span>
        </div>
        <div className="runner-up-box">
          <span className="runner-label">Runner-Up Choice:</span>
          <p>{data.runner_up.class} <span className="dim">({data.runner_up.confidence})</span></p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-wrapper">
      {/* --- Professional Navbar --- */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🛰️</span>
            <span className="logo-text">GeoIntelligence<span className="logo-accent">AI</span></span>
          </div>
          <div className="nav-links">
            
          </div>
          <div className="nav-status">
            <span className="status-indicator online"></span>
            <span className="status-text">Engine API Online</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="app-container">
        <header className="dashboard-header">
          <h1>Satellite Land Cover Classification</h1>
          <p className="subtitle">Deploy Deep Learning models to extract geospatial intelligence instantly.</p>
        </header>

        <div className="dashboard-grid">
          {/* Left Control Column */}
          <div className="control-panel">
            <form onSubmit={handleUpload}>
              
              <div className={`upload-zone ${previewUrl ? 'has-preview' : ''}`}>
                <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="file-label">
                  {previewUrl ? (
                    <div className="preview-wrapper">
                      <img src={previewUrl} alt="Satellite Preview" className="image-preview" />
                      <div className="change-overlay">Change Image</div>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <span className="upload-icon">📥</span>
                      <p>Click or drag your satellite image here</p>
                      <span className="file-type-hint">Supports JPEG, PNG, TIFF</span>
                    </div>
                  )}
                </label>
              </div>

              <div className="model-selector">
                <h4>Select Framework Mode</h4>
                <div className="card-selector-grid">
                  <div 
                    className={`model-card ${selectedModel === 'cnn' ? 'active' : ''}`}
                    onClick={() => handleModelChange('cnn')}
                  >
                    <span className="model-icon">🧠</span>
                    <h5>Custom CNN</h5>
                    <small>Optimized 128x128</small>
                  </div>

                  <div 
                    className={`model-card ${selectedModel === 'mobilenet' ? 'active' : ''}`}
                    onClick={() => handleModelChange('mobilenet')}
                  >
                    <span className="model-icon">⚡</span>
                    <h5>MobileNetV2</h5>
                    <small>Scalable 224x224</small>
                  </div>

                  <div 
                    className={`model-card ${selectedModel === 'compare' ? 'active' : ''}`}
                    onClick={() => handleModelChange('compare')}
                  >
                    <span className="model-icon">⚖️</span>
                    <h5>Side-by-Side</h5>
                    <small>Cross-validation</small>
                  </div>
                </div>
              </div>

              <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? (
                  <div className="spinner-container">
                    <span className="spinner"></span> Analyzing Raster...
                  </div>
                ) : "Run Classification Inference"}
              </button>
            </form>

            {error && <div className="error-message">⚠️ {error}</div>}
          </div>

          {/* Right Output Results Column */}
          <div className="results-panel">
            {!predictionData && !loading && (
              <div className="empty-state">
                <span>📡</span>
                <p>Upload a raster data snippet and run inference to populate real-time diagnostics.</p>
              </div>
            )}

            {loading && (
              <div className="skeleton-loader-container">
                <div className="skeleton-card pulsing"></div>
                {selectedModel === 'compare' && <div className="skeleton-card pulsing"></div>}
              </div>
            )}

            {predictionData && !loading && (
              <div className="results-container animate-fade-in">
                {selectedModel === 'compare' ? (
                  <div>
                    <div className={`agreement-banner ${predictionData.models_agree ? 'agree' : 'disagree'}`}>
                      <h4>
                        {predictionData.models_agree 
                          ? "✅ High Confidence: Models Mutually Agree" 
                          : "⚠️ Variance Detected: Models Disagree"}
                      </h4>
                    </div>
                    <div className="comparison-grid">
                      <RenderSingleResult data={predictionData.CNN} />
                      <RenderSingleResult data={predictionData.MobileNetV2} />
                    </div>
                  </div>
                ) : (
                  <RenderSingleResult data={predictionData} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;