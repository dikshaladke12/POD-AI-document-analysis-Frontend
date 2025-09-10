import React, { useState } from "react";
import { validateForm } from "../../Utils/FormValidation";
import "../../Styles/form.css"; // Ensure this path is correct

const DynamicForm = ({ fields, onSubmit, buttons = [] }) => {
  const [formData, setFormData] = useState(() =>
    fields.reduce((acc, field) => {
      if (field.type === "checkbox-group") acc[field.name] = [];
      else if (field.type === 'date-group') acc[field.name] = Array(field.count || 1).fill('');
      else if (field.type === "checkbox") acc[field.name] = false;
      else acc[field.name] = "";
      return acc;
    }, {})
  );

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(fields, formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      // Use a custom message box instead of alert()
      // You'll need to implement a modal or similar UI for this
      console.error("Invalid form. Please fix errors.");
    }
  };

  const renderField = (field) => {
    const error = errors[field.name];

    switch (field.type) {
      case "textarea":
        return (
          <>
            <textarea
              className="form-input"
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={(e) => handleChange(e, field)}
            />
            {error && <div className="form-error">{error}</div>}
          </>
        );

      case "select":
        return (
          <>
            <select
              className="form-input"
              name={field.name}
              value={formData[field.name]}
              onChange={(e) => handleChange(e, field)}
            >
              <option value="">Select {field.label || field.name}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <div className="form-error">{error}</div>}
          </>
        );

      case "radio":
        return (
          <>
            <div>
              {field.options?.map((opt) => (
                <label key={opt.value} className="form-label">
                  <input
                    type="radio"
                    name={field.name}
                    value={opt.value}
                    checked={formData[field.name] === opt.value}
                    onChange={(e) => handleChange(e, field)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {error && <div className="form-error">{error}</div>}
          </>
        );

      case "checkbox-group":
        return (
          <>
            <div>
              {field.options?.map((opt) => (
                <label key={opt.value} className="form-label">
                  <input
                    type="checkbox"
                    name={field.name}
                    value={opt.value}
                    checked={formData[field.name].includes(opt.value)}
                    onChange={(e) => handleChange(e, field)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {error && <div className="form-error">{error}</div>}
          </>
        );

      case "checkbox":
        return (
          <>
            <label className="form-label">
              <input
                type="checkbox"
                name={field.name}
                checked={formData[field.name]}
                onChange={(e) => handleChange(e, field)}
              />
              {field.label}
            </label>
            {error && <div className="form-error">{error}</div>}
          </>
        );

      case "date":
        return (
          <>
            <input
              type="date"
              className="form-input"
              name={field.name}
              value={formData[field.name]}
              onChange={(e) => handleChange(e, field)}
              onBlur={() => handleBlur(field)}
            />
            {error && <div className="form-error">{error}</div>}
          </>
        );

      case "date-group":
        return (
          <>
            {(formData[field.name] || []).map((val, idx) => (
              <input
                key={idx}
                type="date"
                className="form-input mb-2"
                value={val}
                onChange={(e) => {
                  const updated = [...formData[field.name]];
                  updated[idx] = e.target.value;
                  setFormData((prev) => ({ ...prev, [field.name]: updated }));
                }}
                onBlur={() => {
                  const validationErrors = validateForm([field], formData);
                  setErrors((prev) => ({ ...prev, ...validationErrors }));
                }}
              />
            ))}
            {error && <div className="form-error">{error}</div>}
          </>
        );

      default:
        return (
          <>
            <input
              type={field.type || "text"}
              className="form-input"
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={(e) => handleChange(e, field)}
              onBlur={() => handleBlur(field)}
            />
            {error && <div className="form-error">{error}</div>}
          </>
        );
    }
  };

  const handleBlur = (field) => {
    const validationErrors = validateForm([field], formData);
    setErrors((prev) => ({ ...prev, ...validationErrors }));
  };

  const handleChange = (e, field) => {
    const { name, value, checked, type } = e.target;

    if (field.type === "checkbox-group") {
      setFormData((prev) => {
        const selected = prev[name];
        const updated = checked
          ? [...selected, value]
          : selected.filter((v) => v !== value);
        return { ...prev, [name]: updated };
      });
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dynamic-form"> {/* Use a custom class for the form */}
      {fields.map((field) => (
        <div key={field.name} className="form-group"> {/* Add form-group class here */}
          {field.type !== "checkbox" &&
            field.type !== "checkbox-group" &&
            field.type !== "radio" && (
              <label className="form-label">{field.label || field.name}</label>
            )}
          {renderField(field)}
        </div>
      ))}

      <div className="form-buttons-container"> {/* Container for centering buttons */}
        {buttons.length > 0 ? (
          buttons.map((btn, idx) => (
            <button
              key={idx}
              type={btn.type || "button"}
              onClick={btn.type === "submit" ? handleSubmit : btn.onClick}
              className={`form-button ${btn.className || ""}`}
            >
              {btn.label}
            </button>
          ))
        ) : (
          <button type="submit" className="form-button">
            Submit
          </button>
        )}
      </div>
    </form>
  );
};

export default DynamicForm;

// import React, { useState } from "react";
// import { validateForm } from "../../Utils/FormValidation";
// import "../../Styles/form.css";

// const DynamicForm = ({ fields, onSubmit, buttons = [] }) => {
//   const [formData, setFormData] = useState(() =>
//     fields.reduce((acc, field) => {
//       if (field.type === "checkbox-group") acc[field.name] = [];
//       else if (field.type === 'date-group') acc[field.name] = Array(field.count || 1).fill('');
//       else if (field.type === "checkbox") acc[field.name] = false;
//       else acc[field.name] = "";
//       return acc;
//     }, {})
//   );
  

//   const [errors, setErrors] = useState({});

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const validationErrors = validateForm(fields, formData);
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length === 0) {
//       onSubmit(formData);
//     } else {
//       alert("Invalid form. Please fix errors.");
//     }
//   };

//   const renderField = (field) => {
//     const error = errors[field.name];

//     switch (field.type) {
//       case "textarea":
//         return (
//           <>
//             <textarea
//               className="form-input"
//               name={field.name}
//               placeholder={field.placeholder}
//               value={formData[field.name]}
//               onChange={(e) => handleChange(e, field)}
//             />
//             {error && <div className="form-error">{error}</div>}
//           </>
//         );

//       case "select":
//         return (
//           <>
//             <select
//               className="form-input"
//               name={field.name}
//               value={formData[field.name]}
//               onChange={(e) => handleChange(e, field)}
//             >
//               <option value="">Select {field.label || field.name}</option>
//               {field.options?.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//             {error && <div className="form-error">{error}</div>}
//           </>
//         );

//       case "radio":
//         return (
//           <>
//             <div>
//               {field.options?.map((opt) => (
//                 <label key={opt.value} className="form-label">
//                   <input
//                     type="radio"
//                     name={field.name}
//                     value={opt.value}
//                     checked={formData[field.name] === opt.value}
//                     onChange={(e) => handleChange(e, field)}
//                   />
//                   {opt.label}
//                 </label>
//               ))}
//             </div>
//             {error && <div className="form-error">{error}</div>}
//           </>
//         );

//       case "checkbox-group":
//         return (
//           <>
//             <div>
//               {field.options?.map((opt) => (
//                 <label key={opt.value} className="form-label">
//                   <input
//                     type="checkbox"
//                     name={field.name}
//                     value={opt.value}
//                     checked={formData[field.name].includes(opt.value)}
//                     onChange={(e) => handleChange(e, field)}
//                   />
//                   {opt.label}
//                 </label>
//               ))}
//             </div>
//             {error && <div className="form-error">{error}</div>}
//           </>
//         );

//       case "checkbox":
//         return (
//           <>
//             <label className="form-label">
//               <input
//                 type="checkbox"
//                 name={field.name}
//                 checked={formData[field.name]}
//                 onChange={(e) => handleChange(e, field)}
//               />
//               {field.label}
//             </label>
//             {error && <div className="form-error">{error}</div>}
//           </>
//         );

//       case "date":
//         return (
//           <>
//             <input
//               type="date"
//               className="form-input"
//               name={field.name}
//               value={formData[field.name]}
//               onChange={(e) => handleChange(e, field)}
//               onBlur={() => handleBlur(field)}
//             />
//             {error && <div className="form-error">{error}</div>}
//           </>
//         );

//       case "date-group":
//         return (
//           <>
//             {(formData[field.name] || []).map((val, idx) => (
//               <input
//                 key={idx}
//                 type="date"
//                 className="form-input mb-2"
//                 value={val}
//                 onChange={(e) => {
//                   const updated = [...formData[field.name]];
//                   updated[idx] = e.target.value;
//                   setFormData((prev) => ({ ...prev, [field.name]: updated }));
//                 }}
//                 onBlur={() => {
//                   const validationErrors = validateForm([field], formData);
//                   setErrors((prev) => ({ ...prev, ...validationErrors }));
//                 }}
//               />
//             ))}
//             {error && <div className="form-error">{error}</div>}
//           </>
//         );

//       default:
//         return (
//           <>
//             <input
//               type={field.type || "text"}
//               className="form-input"
//               name={field.name}
//               placeholder={field.placeholder}
//               value={formData[field.name]}
//               onChange={(e) => handleChange(e, field)}
//               onBlur={() => handleBlur(field)}
//             />
//             {error && <div className="form-error">{error}</div>}
//           </>
//         );
//     }
//   };

//   const handleBlur = (field) => {
//     const validationErrors = validateForm([field], formData);
//     setErrors((prev) => ({ ...prev, ...validationErrors }));
//   };

//   const handleChange = (e, field) => {
//     const { name, value, checked, type } = e.target;

//     if (field.type === "checkbox-group") {
//       setFormData((prev) => {
//         const selected = prev[name];
//         const updated = checked
//           ? [...selected, value]
//           : selected.filter((v) => v !== value);
//         return { ...prev, [name]: updated };
//       });
//     } else if (type === "checkbox") {
//       setFormData((prev) => ({ ...prev, [name]: checked }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {fields.map((field) => (
//         <div key={field.name}>
//           {field.type !== "checkbox" &&
//             field.type !== "checkbox-group" &&
//             field.type !== "radio" && (
//               <label className="form-label">{field.label || field.name}</label>
//             )}
//           {renderField(field)}
//         </div>
//       ))}

//       <div className="flex gap-4">
//         {buttons.length > 0 ? (
//           buttons.map((btn, idx) => (
//             <button
//               key={idx}
//               type={btn.type || "button"}
//               onClick={btn.type === "submit" ? handleSubmit : btn.onClick}
//               className={`form-button ${btn.className || ""}`}
//             >
//               {btn.label}
//             </button>
//           ))
//         ) : (
//           <button type="submit" className="form-button">
//             Submit
//           </button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default DynamicForm;
