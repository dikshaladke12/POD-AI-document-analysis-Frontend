import React, { useState } from "react";
import "./FaxUpload.css";
import logo from "../../Assets/hsm_logo_mark.svg";
import Service from "./Service";
import showToast from "../../Shared/Utils/ToastNotification";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from "docx";
import { saveAs } from "file-saver";

const FaxUpload = () => {
  const [file, setFile] = useState(null);
  const [ocrType, setOcrType] = useState("");
  const [jsonInput, setJsonInput] = useState(
    '{\n  "field_name": "condition"\n}'
  );
  const [azureDetails, setAzureDetails] = useState({ key: "", endpoint: "" });
  const [errors, setErrors] = useState({});
  const [responseData, setResponseData] = useState(null);
  const [layout, setLayout] = useState("raw_text"); // 'raw_text' or 'structured_output'

  // File input validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setErrors({ ...errors, file: "Only PDF files are allowed." });
      setFile(null);
    } else {
      setFile(selectedFile);
      setErrors({ ...errors, file: "" });
      setResponseData(null); // Clear previous response on new file upload
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
      setResponseData(null); // Clear previous response on new file drop
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
          const base64File = reader.result.split(",")[1];

          const payload = {
            file: base64File,
            jsonInput,
            ocrType,
            ...(ocrType === "paid" && {
              azureKey: azureDetails.key,
              azureEndpoint: azureDetails.endpoint,
            }),
          };

          console.log("📦 Payload to send:", payload);

          // Call API
          const response = await Service.uploadData(payload);

          if (response?.status === 200) {
            showToast("success", response?.data?.message || "Upload successful");
            setResponseData(response.data); // Store the entire data object
          } else {
            showToast("error", response?.data?.message || "Upload failed");
            setResponseData(null);
          }
        } catch (err) {
          console.error("❌ Error while preparing/uploading file:", err);
          showToast("error", "Something went wrong while uploading file.");
          setResponseData(null);
        }
      };

      reader.readAsDataURL(file); // convert file → base64
    } catch (err) {
      console.error("❌ handleSubmit error:", err);
      showToast("error", "Unexpected error occurred.");
      setResponseData(null);
    }
  };

  // --- Export Functions ---

  const handleExportPDF = () => {
    if (!responseData) {
      showToast("error", "No data to export.");
      return;
    }

    const doc = new jsPDF();
    let y = 10;
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(18);
    doc.text("Extracted Data Report", margin, y);
    y += 10;

    doc.setFontSize(12);

    // Add Raw Text
    y += 5;
    const rawTextTitle = "Raw Text";
    doc.text(rawTextTitle, margin, y);
    y += 5;
    const rawTextLines = doc.splitTextToSize(responseData.raw_text, doc.internal.pageSize.width - margin * 2);
    rawTextLines.forEach(line => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 5;
    });

    // Add Structured Output
    if (responseData.structured_output) {
      try {
        const parsedData = JSON.parse(responseData.structured_output);
        y += 10;
        const structuredTitle = "Structured Output";
        doc.text(structuredTitle, margin, y);
        y += 5;
        const structuredLines = doc.splitTextToSize(JSON.stringify(parsedData, null, 2), doc.internal.pageSize.width - margin * 2);
        structuredLines.forEach(line => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 5;
        });
      } catch (e) {
        showToast("error", "Failed to parse structured output for PDF export.");
      }
    }

    doc.save("extracted_data.pdf");
    showToast("success", "PDF exported successfully!");
  };

  const handleExportExcel = () => {
    if (!responseData || !responseData.structured_output) {
      showToast("error", "No structured data to export to Excel.");
      return;
    }

    try {
      const structuredData = JSON.parse(responseData.structured_output);
      const dataArray = Object.keys(structuredData).map(key => ({
        Field: key,
        Value: structuredData[key]
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataArray);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
      XLSX.writeFile(workbook, "extracted_data.xlsx");
      showToast("success", "Excel file exported successfully!");
    } catch (e) {
      showToast("error", "Failed to parse structured output for Excel export.");
    }
  };

  const handleExportDoc = async () => {
    if (!responseData) {
      showToast("error", "No data to export.");
      return;
    }

    const children = [
      new Paragraph({
        children: [
          new TextRun({
            text: "Extracted Data Report",
            bold: true,
            size: 24,
          }),
        ],
      }),
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [
          new TextRun({ text: "Raw Text:", bold: true, size: 18 }),
        ],
      }),
      new Paragraph({ text: responseData.raw_text }),
    ];

    if (responseData.structured_output) {
      try {
        const parsedOutput = JSON.parse(responseData.structured_output);
        children.push(
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Structured Output:", bold: true, size: 18 }),
            ],
          })
        );
        Object.keys(parsedOutput).forEach(key => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${key}:`, bold: true }),
                new TextRun({ text: ` ${parsedOutput[key]}` }),
              ],
            })
          );
        });
      } catch (e) {
        showToast("error", "Failed to parse structured output for DOCX export.");
      }
    }

    const document = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    const buffer = await Packer.toBuffer(document);
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), "extracted_data.docx");
    showToast("success", "DOCX file exported successfully!");
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
        {file && !responseData && (
          <div className="step-card">
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
        {file && !responseData && (
          <div className="step-card">
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
        {file && !responseData && (ocrType === "free" || ocrType === "paid") && (
          <div className="step-card">
            <button className="submit-btn" onClick={handleSubmit}>
              {ocrType === "free"
                ? "Upload with Tesseract OCR"
                : "Upload with Azure OCR"}
            </button>
          </div>
        )}

        {/* --- New Section: Response Preview and Export --- */}
        {responseData && (
          <>
            <div className="step-card">
              <h3 className="step-title">Extracted Data Preview</h3>
              <div className="layout-selector">
                <button
                  className={layout === "raw_text" ? "active" : ""}
                  onClick={() => setLayout("raw_text")}
                >
                  Raw Text
                </button>
                {responseData.structured_output && (
                  <button
                    className={layout === "structured_output" ? "active" : ""}
                    onClick={() => setLayout("structured_output")}
                  >
                    Structured Output
                  </button>
                )}
              </div>

              {/* Data Display */}
              <div className="data-preview">
                {layout === "raw_text" ? (
                  <pre className="json-pre">
                    {responseData.raw_text}
                  </pre>
                ) : (
                  <pre className="json-pre">
                    {JSON.stringify(JSON.parse(responseData.structured_output), null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <div className="step-card">
              <h3 className="step-title">Export Options</h3>
              <div className="export-options">
                <button className="export-btn pdf-btn" onClick={handleExportPDF}>
                  <span className="export-icon">📄</span> Export to PDF
                </button>
                {responseData.structured_output && (
                  <button className="export-btn excel-btn" onClick={handleExportExcel}>
                    <span className="export-icon">📊</span> Export to Excel
                  </button>
                )}
                <button className="export-btn doc-btn" onClick={handleExportDoc}>
                  <span className="export-icon">📝</span> Export to DOCX
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FaxUpload;

// import React, { useState } from "react";
// import "./FaxUpload.css";
// import logo from "../../Assets/hsm_logo_mark.svg";
// import Service from "./Service";
// import showToast from "../../Shared/Utils/ToastNotification";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import { Document, Packer, Paragraph, TextRun } from "docx";
// import { saveAs } from "file-saver";

// const FaxUpload = () => {
//   const [file, setFile] = useState(null);
//   const [ocrType, setOcrType] = useState("");
//   const [jsonInput, setJsonInput] = useState(
//     '{\n  "field_name": "condition"\n}'
//   );
//   const [azureDetails, setAzureDetails] = useState({ key: "", endpoint: "" });
//   const [errors, setErrors] = useState({});
//   const [responseData, setResponseData] = useState(null);
//   const [layout, setLayout] = useState("raw_text"); // 'raw_text' or 'structured_output'

//   // File input validation
//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type !== "application/pdf") {
//       setErrors({ ...errors, file: "Only PDF files are allowed." });
//       setFile(null);
//     } else {
//       setFile(selectedFile);
//       setErrors({ ...errors, file: "" });
//       setResponseData(null); // Clear previous response on new file upload
//     }
//   };

//   // Drag & Drop validation
//   const handleDrop = (e) => {
//     e.preventDefault();
//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile && droppedFile.type !== "application/pdf") {
//       setErrors({ ...errors, file: "Only PDF files are allowed." });
//       setFile(null);
//     } else {
//       setFile(droppedFile);
//       setErrors({ ...errors, file: "" });
//       setResponseData(null); // Clear previous response on new file drop
//     }
//   };

//   const handleDragOver = (e) => e.preventDefault();

//   // Validation function
//   const validateForm = () => {
//     const newErrors = {};

//     if (!file) {
//       newErrors.file = "Please upload a PDF file.";
//     }

//     try {
//       JSON.parse(jsonInput);
//     } catch (e) {
//       newErrors.jsonInput = "Invalid JSON format.";
//     }

//     if (!ocrType) {
//       newErrors.ocrType = "Please select an OCR option.";
//     }

//     if (ocrType === "paid") {
//       if (!azureDetails.key.trim()) {
//         newErrors.azureKey = "Azure Key is required.";
//       }
//       if (!azureDetails.endpoint.trim()) {
//         newErrors.azureEndpoint = "Azure Endpoint is required.";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     if (!file) {
//       showToast("error", "Please upload a file before submitting.");
//       return;
//     }

//     try {
//       const reader = new FileReader();

//       reader.onloadend = async () => {
//         try {
//           const base64File = reader.result.split(",")[1];

//           const payload = {
//             file: base64File,
//             jsonInput,
//             ocrType,
//             ...(ocrType === "paid" && {
//               azureKey: azureDetails.key,
//               azureEndpoint: azureDetails.endpoint,
//             }),
//           };

//           console.log("📦 Payload to send:", payload);

//           // Call API
//           const response = await Service.uploadData(payload);

//           if (response?.status === 200) {
//             showToast("success", response?.data?.message || "Upload successful");
//             setResponseData(response.data); // Store the entire data object
//           } else {
//             showToast("error", response?.data?.message || "Upload failed");
//             setResponseData(null);
//           }
//         } catch (err) {
//           console.error("❌ Error while preparing/uploading file:", err);
//           showToast("error", "Something went wrong while uploading file.");
//           setResponseData(null);
//         }
//       };

//       reader.readAsDataURL(file); // convert file → base64
//     } catch (err) {
//       console.error("❌ handleSubmit error:", err);
//       showToast("error", "Unexpected error occurred.");
//       setResponseData(null);
//     }
//   };

//   // --- Export Functions ---

//   const handleExportPDF = () => {
//     if (!responseData) {
//       showToast("error", "No data to export.");
//       return;
//     }

//     const doc = new jsPDF();
//     let y = 10;
//     const margin = 10;
//     const pageHeight = doc.internal.pageSize.height;

//     doc.setFontSize(18);
//     doc.text("Extracted Data Report", margin, y);
//     y += 10;

//     doc.setFontSize(12);

//     // Add Raw Text
//     y += 5;
//     const rawTextTitle = "Raw Text";
//     doc.text(rawTextTitle, margin, y);
//     y += 5;
//     const rawTextLines = doc.splitTextToSize(responseData.raw_text, doc.internal.pageSize.width - margin * 2);
//     rawTextLines.forEach(line => {
//       if (y > pageHeight - margin) {
//         doc.addPage();
//         y = margin;
//       }
//       doc.text(line, margin, y);
//       y += 5;
//     });

//     // Add Structured Output
//     if (responseData.structured_output) {
//       y += 10;
//       const structuredTitle = "Structured Output";
//       doc.text(structuredTitle, margin, y);
//       y += 5;
//       const structuredLines = doc.splitTextToSize(JSON.stringify(JSON.parse(responseData.structured_output), null, 2), doc.internal.pageSize.width - margin * 2);
//       structuredLines.forEach(line => {
//         if (y > pageHeight - margin) {
//           doc.addPage();
//           y = margin;
//         }
//         doc.text(line, margin, y);
//         y += 5;
//       });
//     }

//     doc.save("extracted_data.pdf");
//     showToast("success", "PDF exported successfully!");
//   };

//   const handleExportExcel = () => {
//     if (!responseData || !responseData.structured_output) {
//       showToast("error", "No structured data to export to Excel.");
//       return;
//     }

//     const structuredData = JSON.parse(responseData.structured_output);
//     const dataArray = Object.keys(structuredData).map(key => ({
//       Field: key,
//       Value: structuredData[key]
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(dataArray);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
//     XLSX.writeFile(workbook, "extracted_data.xlsx");
//     showToast("success", "Excel file exported successfully!");
//   };

//   const handleExportDoc = async () => {
//     if (!responseData) {
//       showToast("error", "No data to export.");
//       return;
//     }

//     const children = [
//       new Paragraph({
//         children: [
//           new TextRun({
//             text: "Extracted Data Report",
//             bold: true,
//             size: 24,
//           }),
//         ],
//       }),
//       new Paragraph({ text: "" }),
//       new Paragraph({
//         children: [
//           new TextRun({ text: "Raw Text:", bold: true, size: 18 }),
//         ],
//       }),
//       new Paragraph({ text: responseData.raw_text }),
//     ];

//     if (responseData.structured_output) {
//       children.push(
//         new Paragraph({ text: "" }),
//         new Paragraph({
//           children: [
//             new TextRun({ text: "Structured Output:", bold: true, size: 18 }),
//           ],
//         })
//       );
//       const parsedOutput = JSON.parse(responseData.structured_output);
//       Object.keys(parsedOutput).forEach(key => {
//         children.push(
//           new Paragraph({
//             children: [
//               new TextRun({ text: `${key}:`, bold: true }),
//               new TextRun({ text: ` ${parsedOutput[key]}` }),
//             ],
//           })
//         );
//       });
//     }

//     const document = new Document({
//       sections: [{
//         properties: {},
//         children,
//       }],
//     });

//     const buffer = await Packer.toBuffer(document);
//     saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), "extracted_data.docx");
//     showToast("success", "DOCX file exported successfully!");
//   };

//   return (
//     <div className="fax-container">
//       {/* Navbar */}
//       <header className="fax-header">
//         <div className="logo">
//           <span className="logo-icon">📄</span>
//           <h2>Fax Uploader</h2>
//         </div>
//         <div className="nav-right">
//           <img src={logo} alt="Company Logo" className="nav-logo" />
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="fax-main">
//         {/* Step 1: Upload */}
//         <div className="step-card">
//           <div
//             className="upload-box"
//             onDrop={handleDrop}
//             onDragOver={handleDragOver}
//           >
//             <div className="upload-icon">📑</div>
//             <p>
//               <strong>Drag & Drop your Fax PDFs here</strong>
//               <br />
//               or click to upload • Only PDF files are supported
//             </p>
//             <label className="upload-btn">
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 onChange={handleFileChange}
//                 hidden
//               />
//               Select Files
//             </label>
//           </div>
//           {file && (
//             <div className="file-preview">
//               <p>
//                 📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
//               </p>
//             </div>
//           )}
//           {errors.file && <p className="error-text">{errors.file}</p>}
//         </div>

//         {/* Step 2: JSON Input */}
//         {file && !responseData && (
//           <div className="step-card">
//             <p className="step-subtext">
//               Provide the fields and conditions in JSON format for data
//               extraction.
//             </p>
//             <textarea
//               value={jsonInput}
//               onChange={(e) => setJsonInput(e.target.value)}
//               rows={8}
//               className="json-input"
//             />
//             {errors.jsonInput && (
//               <p className="error-text">{errors.jsonInput}</p>
//             )}
//           </div>
//         )}

//         {/* Step 3: OCR Selection */}
//         {file && !responseData && (
//           <div className="step-card">
//             <div className="option-grid">
//               {/* Free OCR */}
//               <label
//                 className={`option-card ${ocrType === "free" ? "selected" : ""}`}
//               >
//                 <input
//                   type="radio"
//                   name="ocrType"
//                   value="free"
//                   checked={ocrType === "free"}
//                   onChange={(e) => setOcrType(e.target.value)}
//                 />
//                 <div className="option-content">
//                   <h4>Free OCR</h4>
//                   <p>Tesseract OCR (local processing)</p>
//                 </div>
//               </label>

//               {/* Paid OCR (Azure only) */}
//               <label
//                 className={`option-card ${ocrType === "paid" ? "selected" : ""}`}
//               >
//                 <input
//                   type="radio"
//                   name="ocrType"
//                   value="paid"
//                   checked={ocrType === "paid"}
//                   onChange={(e) => setOcrType(e.target.value)}
//                 />
//                 <div className="option-content">
//                   <h4>Azure OCR</h4>
//                   <p>Microsoft Cognitive Services</p>
//                 </div>
//               </label>
//             </div>
//             {errors.ocrType && <p className="error-text">{errors.ocrType}</p>}

//             {/* Azure Config */}
//             {ocrType === "paid" && (
//               <div className="config-box">
//                 <input
//                   type="text"
//                   placeholder="AZURE OCR KEY"
//                   value={azureDetails.key}
//                   onChange={(e) =>
//                     setAzureDetails({ ...azureDetails, key: e.target.value })
//                   }
//                 />
//                 {errors.azureKey && (
//                   <p className="error-text">{errors.azureKey}</p>
//                 )}

//                 <input
//                   type="text"
//                   placeholder="AZURE OCR ENDPOINT"
//                   value={azureDetails.endpoint}
//                   onChange={(e) =>
//                     setAzureDetails({
//                       ...azureDetails,
//                       endpoint: e.target.value,
//                     })
//                   }
//                 />
//                 {errors.azureEndpoint && (
//                   <p className="error-text">{errors.azureEndpoint}</p>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Step 4: Submit */}
//         {file && !responseData && (ocrType === "free" || ocrType === "paid") && (
//           <div className="step-card">
//             <button className="submit-btn" onClick={handleSubmit}>
//               {ocrType === "free"
//                 ? "Upload with Tesseract OCR"
//                 : "Upload with Azure OCR"}
//             </button>
//           </div>
//         )}

//         {/* --- New Section: Response Preview and Export --- */}
//         {responseData && (
//           <>
//             <div className="step-card">
//               <h3 className="step-title">Extracted Data Preview</h3>
//               <div className="layout-selector">
//                 <button
//                   className={layout === "raw_text" ? "active" : ""}
//                   onClick={() => setLayout("raw_text")}
//                 >
//                   Raw Text
//                 </button>
//                 {responseData.structured_output && (
//                   <button
//                     className={layout === "structured_output" ? "active" : ""}
//                     onClick={() => setLayout("structured_output")}
//                   >
//                     Structured Output
//                   </button>
//                 )}
//               </div>

//               {/* Data Display */}
//               <div className="data-preview">
//                 {layout === "raw_text" ? (
//                   <pre className="json-pre">
//                     {responseData.raw_text}
//                   </pre>
//                 ) : (
//                   <pre className="json-pre">
//                     {JSON.stringify(JSON.parse(responseData.structured_output), null, 2)}
//                   </pre>
//                 )}
//               </div>
//             </div>

//             <div className="step-card">
//               <h3 className="step-title">Export Options</h3>
//               <div className="export-options">
//                 <button className="export-btn pdf-btn" onClick={handleExportPDF}>
//                   <span className="export-icon">📄</span> Export to PDF
//                 </button>
//                 {responseData.structured_output && (
//                   <button className="export-btn excel-btn" onClick={handleExportExcel}>
//                     <span className="export-icon">📊</span> Export to Excel
//                   </button>
//                 )}
//                 <button className="export-btn doc-btn" onClick={handleExportDoc}>
//                   <span className="export-icon">📝</span> Export to DOCX
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </main>
//     </div>
//   );
// };

// export default FaxUpload;


// import React, { useState } from "react";
// import "./FaxUpload.css";
// import logo from "../../Assets/hsm_logo_mark.svg";
// import Service from "./Service";
// import showToast from "../../Shared/Utils/ToastNotification";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import { Document, Packer, Paragraph, TextRun } from "docx";
// import { saveAs } from "file-saver";

// const FaxUpload = () => {
//   const [file, setFile] = useState(null);
//   const [ocrType, setOcrType] = useState("");
//   const [jsonInput, setJsonInput] = useState(
//     '{\n  "field_name": "condition"\n}'
//   );
//   const [azureDetails, setAzureDetails] = useState({ key: "", endpoint: "" });
//   const [errors, setErrors] = useState({});
//   const [responseData, setResponseData] = useState(null);
//   const [layout, setLayout] = useState("table"); // 'table' or 'json'

//   // File input validation
//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type !== "application/pdf") {
//       setErrors({ ...errors, file: "Only PDF files are allowed." });
//       setFile(null);
//     } else {
//       setFile(selectedFile);
//       setErrors({ ...errors, file: "" });
//       setResponseData(null); // Clear previous response on new file upload
//     }
//   };

//   // Drag & Drop validation
//   const handleDrop = (e) => {
//     e.preventDefault();
//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile && droppedFile.type !== "application/pdf") {
//       setErrors({ ...errors, file: "Only PDF files are allowed." });
//       setFile(null);
//     } else {
//       setFile(droppedFile);
//       setErrors({ ...errors, file: "" });
//       setResponseData(null); // Clear previous response on new file drop
//     }
//   };

//   const handleDragOver = (e) => e.preventDefault();

//   // Validation function
//   const validateForm = () => {
//     const newErrors = {};

//     if (!file) {
//       newErrors.file = "Please upload a PDF file.";
//     }

//     try {
//       JSON.parse(jsonInput);
//     } catch (e) {
//       newErrors.jsonInput = "Invalid JSON format.";
//     }

//     if (!ocrType) {
//       newErrors.ocrType = "Please select an OCR option.";
//     }

//     if (ocrType === "paid") {
//       if (!azureDetails.key.trim()) {
//         newErrors.azureKey = "Azure Key is required.";
//       }
//       if (!azureDetails.endpoint.trim()) {
//         newErrors.azureEndpoint = "Azure Endpoint is required.";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     if (!file) {
//       showToast("error", "Please upload a file before submitting.");
//       return;
//     }

//     try {
//       const reader = new FileReader();

//       reader.onloadend = async () => {
//         try {
//           const base64File = reader.result.split(",")[1];

//           const payload = {
//             file: base64File,
//             jsonInput,
//             ocrType,
//             ...(ocrType === "paid" && {
//               azureKey: azureDetails.key,
//               azureEndpoint: azureDetails.endpoint,
//             }),
//           };

//           console.log("📦 Payload to send:", payload);

//           // Call API
//           const response = await Service.uploadData(payload);

//           if (response?.status === 200) {
//             showToast("success", response?.data?.message || "Upload successful");
//             setResponseData(response.data.extractedData); // Store the extracted data
//           } else {
//             showToast("error", response?.data?.message || "Upload failed");
//             setResponseData(null);
//           }
//         } catch (err) {
//           console.error("❌ Error while preparing/uploading file:", err);
//           showToast("error", "Something went wrong while uploading file.");
//           setResponseData(null);
//         }
//       };

//       reader.readAsDataURL(file); // convert file → base64
//     } catch (err) {
//       console.error("❌ handleSubmit error:", err);
//       showToast("error", "Unexpected error occurred.");
//       setResponseData(null);
//     }
//   };

//   // --- Export Functions ---

//   const handleExportPDF = () => {
//     if (!responseData) {
//       showToast("error", "No data to export.");
//       return;
//     }

//     const doc = new jsPDF();
//     let y = 10;
//     const margin = 10;

//     doc.text("Extracted Data Report", 10, y);
//     y += 10;

//     Object.keys(responseData).forEach(key => {
//       const value = responseData[key];
//       const text = `${key}: ${JSON.stringify(value, null, 2)}`;
//       const splitText = doc.splitTextToSize(text, doc.internal.pageSize.width - margin * 2);
//       doc.text(splitText, margin, y);
//       y += doc.getTextDimensions(splitText).h + 5;
//     });

//     doc.save("extracted_data.pdf");
//     showToast("success", "PDF exported successfully!");
//   };

//   const handleExportExcel = () => {
//     if (!responseData) {
//       showToast("error", "No data to export.");
//       return;
//     }

//     const dataArray = Object.keys(responseData).map(key => ({
//       Field: key,
//       Value: JSON.stringify(responseData[key])
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(dataArray);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
//     XLSX.writeFile(workbook, "extracted_data.xlsx");
//     showToast("success", "Excel file exported successfully!");
//   };

//   const handleExportDoc = async () => {
//     if (!responseData) {
//       showToast("error", "No data to export.");
//       return;
//     }

//     const document = new Document({
//       sections: [{
//         properties: {},
//         children: [
//           new Paragraph({
//             children: [
//               new TextRun({
//                 text: "Extracted Data Report",
//                 bold: true,
//                 size: 24,
//               }),
//             ],
//           }),
//           ...Object.keys(responseData).map(key => 
//             new Paragraph({
//               children: [
//                 new TextRun({ text: `${key}:`, bold: true }),
//                 new TextRun({ text: ` ${JSON.stringify(responseData[key], null, 2)}` }),
//               ],
//             })
//           ),
//         ],
//       }],
//     });

//     const buffer = await Packer.toBuffer(document);
//     saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), "extracted_data.docx");
//     showToast("success", "DOCX file exported successfully!");
//   };

//   return (
//     <div className="fax-container">
//       {/* Navbar */}
//       <header className="fax-header">
//         <div className="logo">
//           <span className="logo-icon">📄</span>
//           <h2>Fax Uploader</h2>
//         </div>
//         <div className="nav-right">
//           <img src={logo} alt="Company Logo" className="nav-logo" />
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="fax-main">
//         {/* Step 1: Upload */}
//         <div className="step-card">
//           <div
//             className="upload-box"
//             onDrop={handleDrop}
//             onDragOver={handleDragOver}
//           >
//             <div className="upload-icon">📑</div>
//             <p>
//               <strong>Drag & Drop your Fax PDFs here</strong>
//               <br />
//               or click to upload • Only PDF files are supported
//             </p>
//             <label className="upload-btn">
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 onChange={handleFileChange}
//                 hidden
//               />
//               Select Files
//             </label>
//           </div>
//           {file && (
//             <div className="file-preview">
//               <p>
//                 📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
//               </p>
//             </div>
//           )}
//           {errors.file && <p className="error-text">{errors.file}</p>}
//         </div>

//         {/* Step 2: JSON Input */}
//         {file && !responseData && (
//           <div className="step-card">
//             <p className="step-subtext">
//               Provide the fields and conditions in JSON format for data
//               extraction.
//             </p>
//             <textarea
//               value={jsonInput}
//               onChange={(e) => setJsonInput(e.target.value)}
//               rows={8}
//               className="json-input"
//             />
//             {errors.jsonInput && (
//               <p className="error-text">{errors.jsonInput}</p>
//             )}
//           </div>
//         )}

//         {/* Step 3: OCR Selection */}
//         {file && !responseData && (
//           <div className="step-card">
//             <div className="option-grid">
//               {/* Free OCR */}
//               <label
//                 className={`option-card ${ocrType === "free" ? "selected" : ""}`}
//               >
//                 <input
//                   type="radio"
//                   name="ocrType"
//                   value="free"
//                   checked={ocrType === "free"}
//                   onChange={(e) => setOcrType(e.target.value)}
//                 />
//                 <div className="option-content">
//                   <h4>Free OCR</h4>
//                   <p>Tesseract OCR (local processing)</p>
//                 </div>
//               </label>

//               {/* Paid OCR (Azure only) */}
//               <label
//                 className={`option-card ${ocrType === "paid" ? "selected" : ""}`}
//               >
//                 <input
//                   type="radio"
//                   name="ocrType"
//                   value="paid"
//                   checked={ocrType === "paid"}
//                   onChange={(e) => setOcrType(e.target.value)}
//                 />
//                 <div className="option-content">
//                   <h4>Azure OCR</h4>
//                   <p>Microsoft Cognitive Services</p>
//                 </div>
//               </label>
//             </div>
//             {errors.ocrType && <p className="error-text">{errors.ocrType}</p>}

//             {/* Azure Config */}
//             {ocrType === "paid" && (
//               <div className="config-box">
//                 <input
//                   type="text"
//                   placeholder="AZURE OCR KEY"
//                   value={azureDetails.key}
//                   onChange={(e) =>
//                     setAzureDetails({ ...azureDetails, key: e.target.value })
//                   }
//                 />
//                 {errors.azureKey && (
//                   <p className="error-text">{errors.azureKey}</p>
//                 )}

//                 <input
//                   type="text"
//                   placeholder="AZURE OCR ENDPOINT"
//                   value={azureDetails.endpoint}
//                   onChange={(e) =>
//                     setAzureDetails({
//                       ...azureDetails,
//                       endpoint: e.target.value,
//                     })
//                   }
//                 />
//                 {errors.azureEndpoint && (
//                   <p className="error-text">{errors.azureEndpoint}</p>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Step 4: Submit */}
//         {file && !responseData && (ocrType === "free" || ocrType === "paid") && (
//           <div className="step-card">
//             <button className="submit-btn" onClick={handleSubmit}>
//               {ocrType === "free"
//                 ? "Upload with Tesseract OCR"
//                 : "Upload with Azure OCR"}
//             </button>
//           </div>
//         )}

//         {/* --- New Section: Response Preview and Export --- */}
//         {responseData && (
//           <>
//             <div className="step-card">
//               <h3 className="step-title">Extracted Data Preview</h3>
//               <div className="layout-selector">
//                 <button
//                   className={layout === "table" ? "active" : ""}
//                   onClick={() => setLayout("table")}
//                 >
//                   Table View
//                 </button>
//                 <button
//                   className={layout === "json" ? "active" : ""}
//                   onClick={() => setLayout("json")}
//                 >
//                   JSON View
//                 </button>
//               </div>

//               {/* Data Display */}
//               <div className="data-preview">
//                 {layout === "table" ? (
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>Field</th>
//                         <th>Value</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {Object.keys(responseData).map((key) => (
//                         <tr key={key}>
//                           <td>{key}</td>
//                           <td>{JSON.stringify(responseData[key])}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 ) : (
//                   <pre className="json-pre">
//                     {JSON.stringify(responseData, null, 2)}
//                   </pre>
//                 )}
//               </div>
//             </div>

//             <div className="step-card">
//               <h3 className="step-title">Export Options</h3>
//               <div className="export-options">
//                 <button className="export-btn pdf-btn" onClick={handleExportPDF}>
//                   <span className="export-icon">📄</span> Export to PDF
//                 </button>
//                 <button className="export-btn excel-btn" onClick={handleExportExcel}>
//                   <span className="export-icon">📊</span> Export to Excel
//                 </button>
//                 <button className="export-btn doc-btn" onClick={handleExportDoc}>
//                   <span className="export-icon">📝</span> Export to DOCX
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </main>
//     </div>
//   );
// };

// export default FaxUpload;

// import React, { useState } from "react";
// import "./FaxUpload.css";
// import logo from "../../Assets/hsm_logo_mark.svg";
// import Service from "./Service";
// import showToast from "../../Shared/Utils/ToastNotification";

// const FaxUpload = () => {
//   const [file, setFile] = useState(null);
//   const [ocrType, setOcrType] = useState("");
//   const [jsonInput, setJsonInput] = useState(
//     '{\n  "field_name": "condition"\n}'
//   );
//   const [azureDetails, setAzureDetails] = useState({ key: "", endpoint: "" });
//   const [errors, setErrors] = useState({});

//   // File input validation
//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type !== "application/pdf") {
//       setErrors({ ...errors, file: "Only PDF files are allowed." });
//       setFile(null);
//     } else {
//       setFile(selectedFile);
//       setErrors({ ...errors, file: "" });
//     }
//   };

//   // Drag & Drop validation
//   const handleDrop = (e) => {
//     e.preventDefault();
//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile && droppedFile.type !== "application/pdf") {
//       setErrors({ ...errors, file: "Only PDF files are allowed." });
//       setFile(null);
//     } else {
//       setFile(droppedFile);
//       setErrors({ ...errors, file: "" });
//     }
//   };

//   const handleDragOver = (e) => e.preventDefault();

//   // Validation function
//   const validateForm = () => {
//     const newErrors = {};

//     if (!file) {
//       newErrors.file = "Please upload a PDF file.";
//     }

//     try {
//       JSON.parse(jsonInput);
//     } catch (e) {
//       newErrors.jsonInput = "Invalid JSON format.";
//     }

//     if (!ocrType) {
//       newErrors.ocrType = "Please select an OCR option.";
//     }

//     if (ocrType === "paid") {
//       if (!azureDetails.key.trim()) {
//         newErrors.azureKey = "Azure Key is required.";
//       }
//       if (!azureDetails.endpoint.trim()) {
//         newErrors.azureEndpoint = "Azure Endpoint is required.";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     if (!file) {
//       showToast("error", "Please upload a file before submitting.");
//       return;
//     }

//     try {
//       const reader = new FileReader();

//       reader.onloadend = async () => {
//         try {
//           const base64File = reader.result.split(",")[1]; // remove "data:application/pdf;base64,"

//           const payload = {
//             file: base64File,
//             jsonInput,
//             ocrType,
//             ...(ocrType === "paid" && {
//               azureKey: azureDetails.key,
//               azureEndpoint: azureDetails.endpoint,
//             }),
//           };

//           console.log("📦 Payload to send:", payload); // ✅ just print

//           // Call API
//           const response = await Service.uploadData(payload);

//           if (response?.status === 200) {
//             showToast(
//               "success",
//               response?.data?.message || "Upload successful"
//             );
//           } else {
//             showToast("error", response?.data?.message || "Upload failed");
//           }
//         } catch (err) {
//           console.error("❌ Error while preparing/uploading file:", err);
//           showToast("error", "Something went wrong while uploading file.");
//         }
//       };

//       reader.readAsDataURL(file); // convert file → base64
//     } catch (err) {
//       console.error("❌ handleSubmit error:", err);
//       showToast("error", "Unexpected error occurred.");
//     }
//   };

//   return (
//     <div className="fax-container">
//       {/* Navbar */}
//       <header className="fax-header">
//         <div className="logo">
//           <span className="logo-icon">📄</span>
//           <h2>Fax Uploader</h2>
//         </div>
//         <div className="nav-right">
//           <img src={logo} alt="Company Logo" className="nav-logo" />
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="fax-main">
//         {/* Step 1: Upload */}
//         <div className="step-card">
//           {/* <h3 className="step-title">Step 1: Upload Fax Document</h3> */}
//           <div
//             className="upload-box"
//             onDrop={handleDrop}
//             onDragOver={handleDragOver}
//           >
//             <div className="upload-icon">📑</div>
//             <p>
//               <strong>Drag & Drop your Fax PDFs here</strong>
//               <br />
//               or click to upload • Only PDF files are supported
//             </p>
//             <label className="upload-btn">
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 onChange={handleFileChange}
//                 hidden
//               />
//               Select Files
//             </label>
//           </div>
//           {file && (
//             <div className="file-preview">
//               <p>
//                 📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
//               </p>
//             </div>
//           )}
//           {errors.file && <p className="error-text">{errors.file}</p>}
//         </div>

//         {/* Step 2: JSON Input */}
//         {file && (
//           <div className="step-card">
//             {/* <h3 className="step-title">
//               Step 2: Define Extraction Requirements
//             </h3> */}
//             <p className="step-subtext">
//               Provide the fields and conditions in JSON format for data
//               extraction.
//             </p>
//             <textarea
//               value={jsonInput}
//               onChange={(e) => setJsonInput(e.target.value)}
//               rows={8}
//               className="json-input"
//             />
//             {errors.jsonInput && (
//               <p className="error-text">{errors.jsonInput}</p>
//             )}
//           </div>
//         )}

//         {/* Step 3: OCR Selection */}
//         {file && (
//           <div className="step-card">
//             {/* <h3 className="step-title">Step 3: Select OCR Engine</h3> */}

//             <div className="option-grid">
//               {/* Free OCR */}
//               <label
//                 className={`option-card ${ocrType === "free" ? "selected" : ""}`}
//               >
//                 <input
//                   type="radio"
//                   name="ocrType"
//                   value="free"
//                   checked={ocrType === "free"}
//                   onChange={(e) => setOcrType(e.target.value)}
//                 />
//                 <div className="option-content">
//                   <h4>Free OCR</h4>
//                   <p>Tesseract OCR (local processing)</p>
//                 </div>
//               </label>

//               {/* Paid OCR (Azure only) */}
//               <label
//                 className={`option-card ${ocrType === "paid" ? "selected" : ""}`}
//               >
//                 <input
//                   type="radio"
//                   name="ocrType"
//                   value="paid"
//                   checked={ocrType === "paid"}
//                   onChange={(e) => setOcrType(e.target.value)}
//                 />
//                 <div className="option-content">
//                   <h4>Azure OCR</h4>
//                   <p>Microsoft Cognitive Services</p>
//                 </div>
//               </label>
//             </div>
//             {errors.ocrType && <p className="error-text">{errors.ocrType}</p>}

//             {/* Azure Config */}
//             {ocrType === "paid" && (
//               <div className="config-box">
//                 <input
//                   type="text"
//                   placeholder="AZURE OCR KEY"
//                   value={azureDetails.key}
//                   onChange={(e) =>
//                     setAzureDetails({ ...azureDetails, key: e.target.value })
//                   }
//                 />
//                 {errors.azureKey && (
//                   <p className="error-text">{errors.azureKey}</p>
//                 )}

//                 <input
//                   type="text"
//                   placeholder="AZURE OCR ENDPOINT"
//                   value={azureDetails.endpoint}
//                   onChange={(e) =>
//                     setAzureDetails({
//                       ...azureDetails,
//                       endpoint: e.target.value,
//                     })
//                   }
//                 />
//                 {errors.azureEndpoint && (
//                   <p className="error-text">{errors.azureEndpoint}</p>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Step 4: Submit */}
//         {(ocrType === "free" || ocrType === "paid") && (
//           <div className="step-card">
//             {/* <h3 className="step-title">Step 4: Submit</h3> */}
//             <button className="submit-btn" onClick={handleSubmit}>
//               {ocrType === "free"
//                 ? "Upload with Tesseract OCR"
//                 : "Upload with Azure OCR"}
//             </button>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default FaxUpload;
