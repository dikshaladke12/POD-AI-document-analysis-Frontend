import React, { useState } from "react";
import "./FaxUpload.css";
import logo from "../../Assets/hsm_logo_mark.svg";
import Service from "./Service";
import showToast from "../../Shared/Utils/ToastNotification";

const FaxUpload = () => {
  const [file, setFile] = useState(null);
  const [ocrType, setOcrType] = useState("");
  const [jsonInput, setJsonInput] = useState(
    '{\n  "field_name": "condition"\n}'
  );
  const [azureDetails, setAzureDetails] = useState({ key: "", endpoint: "" });
  const [errors, setErrors] = useState({});

  // File input validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setErrors({ ...errors, file: "Only PDF files are allowed." });
      setFile(null);
    } else {
      setFile(selectedFile);
      setErrors({ ...errors, file: "" });
    }
  };

  // Drag & Drop validation
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type !== "application/pdf") {
      setErrors({ ...errors, file: "Only PDF files are allowed." });
      setFile(null);
    } else {
      setFile(droppedFile);
      setErrors({ ...errors, file: "" });
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!file) {
      newErrors.file = "Please upload a PDF file.";
    }

    try {
      JSON.parse(jsonInput);
    } catch (e) {
      newErrors.jsonInput = "Invalid JSON format.";
    }

    if (!ocrType) {
      newErrors.ocrType = "Please select an OCR option.";
    }

    if (ocrType === "paid") {
      if (!azureDetails.key.trim()) {
        newErrors.azureKey = "Azure Key is required.";
      }
      if (!azureDetails.endpoint.trim()) {
        newErrors.azureEndpoint = "Azure Endpoint is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!file) {
      showToast("error", "Please upload a file before submitting.");
      return;
    }

    try {
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64File = reader.result.split(",")[1]; // remove "data:application/pdf;base64,"

          const payload = {
            file: base64File,
            jsonInput,
            ocrType,
            ...(ocrType === "paid" && {
              azureKey: azureDetails.key,
              azureEndpoint: azureDetails.endpoint,
            }),
          };

          console.log("📦 Payload to send:", payload); // ✅ just print

          // Call API
          const response = await Service.uploadData(payload);

          if (response?.status === 200) {
            showToast(
              "success",
              response?.data?.message || "Upload successful"
            );
          } else {
            showToast("error", response?.data?.message || "Upload failed");
          }
        } catch (err) {
          console.error("❌ Error while preparing/uploading file:", err);
          showToast("error", "Something went wrong while uploading file.");
        }
      };

      reader.readAsDataURL(file); // convert file → base64
    } catch (err) {
      console.error("❌ handleSubmit error:", err);
      showToast("error", "Unexpected error occurred.");
    }
  };

  return (
    <div className="fax-container">
      {/* Navbar */}
      <header className="fax-header">
        <div className="logo">
          <span className="logo-icon">📄</span>
          <h2>Fax Uploader</h2>
        </div>
        <div className="nav-right">
          <img src={logo} alt="Company Logo" className="nav-logo" />
        </div>
      </header>

      {/* Main Content */}
      <main className="fax-main">
        {/* Step 1: Upload */}
        <div className="step-card">
          {/* <h3 className="step-title">Step 1: Upload Fax Document</h3> */}
          <div
            className="upload-box"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="upload-icon">📑</div>
            <p>
              <strong>Drag & Drop your Fax PDFs here</strong>
              <br />
              or click to upload • Only PDF files are supported
            </p>
            <label className="upload-btn">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                hidden
              />
              Select Files
            </label>
          </div>
          {file && (
            <div className="file-preview">
              <p>
                📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
          {errors.file && <p className="error-text">{errors.file}</p>}
        </div>

        {/* Step 2: JSON Input */}
        {file && (
          <div className="step-card">
            {/* <h3 className="step-title">
              Step 2: Define Extraction Requirements
            </h3> */}
            <p className="step-subtext">
              Provide the fields and conditions in JSON format for data
              extraction.
            </p>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
              className="json-input"
            />
            {errors.jsonInput && (
              <p className="error-text">{errors.jsonInput}</p>
            )}
          </div>
        )}

        {/* Step 3: OCR Selection */}
        {file && (
          <div className="step-card">
            {/* <h3 className="step-title">Step 3: Select OCR Engine</h3> */}

            <div className="option-grid">
              {/* Free OCR */}
              <label
                className={`option-card ${ocrType === "free" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="ocrType"
                  value="free"
                  checked={ocrType === "free"}
                  onChange={(e) => setOcrType(e.target.value)}
                />
                <div className="option-content">
                  <h4>Free OCR</h4>
                  <p>Tesseract OCR (local processing)</p>
                </div>
              </label>

              {/* Paid OCR (Azure only) */}
              <label
                className={`option-card ${ocrType === "paid" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="ocrType"
                  value="paid"
                  checked={ocrType === "paid"}
                  onChange={(e) => setOcrType(e.target.value)}
                />
                <div className="option-content">
                  <h4>Azure OCR</h4>
                  <p>Microsoft Cognitive Services</p>
                </div>
              </label>
            </div>
            {errors.ocrType && <p className="error-text">{errors.ocrType}</p>}

            {/* Azure Config */}
            {ocrType === "paid" && (
              <div className="config-box">
                <input
                  type="text"
                  placeholder="AZURE OCR KEY"
                  value={azureDetails.key}
                  onChange={(e) =>
                    setAzureDetails({ ...azureDetails, key: e.target.value })
                  }
                />
                {errors.azureKey && (
                  <p className="error-text">{errors.azureKey}</p>
                )}

                <input
                  type="text"
                  placeholder="AZURE OCR ENDPOINT"
                  value={azureDetails.endpoint}
                  onChange={(e) =>
                    setAzureDetails({
                      ...azureDetails,
                      endpoint: e.target.value,
                    })
                  }
                />
                {errors.azureEndpoint && (
                  <p className="error-text">{errors.azureEndpoint}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Submit */}
        {(ocrType === "free" || ocrType === "paid") && (
          <div className="step-card">
            {/* <h3 className="step-title">Step 4: Submit</h3> */}
            <button className="submit-btn" onClick={handleSubmit}>
              {ocrType === "free"
                ? "Upload with Tesseract OCR"
                : "Upload with Azure OCR"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FaxUpload;
