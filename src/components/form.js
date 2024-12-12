import React, { useState } from "react";

const Form = () => {
  const [fields, setFields] = useState([]); // Holds the dynamic form fields
  const [errors, setErrors] = useState([]); // Holds error messages for each field

  // Handles adding a new field
  const handleAddField = () => {
    setFields([...fields, { type: "", name: "", value: "" }]);
    setErrors([...errors, ""]); // Initialize with no error
  };

  // Handles updating the field type
  const handleFieldTypeChange = (index, value) => {
    const updatedFields = [...fields];
    updatedFields[index].type = value;
    setFields(updatedFields);
    validateField(index, updatedFields[index].value, value); // Re-validate when type changes
  };

  // Handles updating the field value
  const handleFieldValueChange = (index, value) => {
    const updatedFields = [...fields];
    updatedFields[index].value = value;
    setFields(updatedFields);
    validateField(index, value, fields[index].type); // Validate the field value
  };

  // Validate field based on its type
  const validateField = (index, value, type) => {
    let errorMessage = "";

    switch (type) {
      case "text":
        if (!/^[a-zA-Z\s]*$/.test(value)) {
          errorMessage = "Please enter valid text.";
        }
        break;
      case "number":
        if (!/^\d+$/.test(value)) {
          errorMessage = "Please enter a valid phone number.";
        }
        break;
      case "date":
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          errorMessage = "Please enter a valid date (YYYY-MM-DD).";
        }
        break;
      default:
        if (value) {
          errorMessage = "Invalid data type selected.";
        }
    }

    const updatedErrors = [...errors];
    updatedErrors[index] = errorMessage;
    setErrors(updatedErrors);
  };

  const getPlaceholder = (type) => {
    switch (type) {
      case "text":
        return "Enter text";
      case "number":
        return "Enter phone number";
      case "date":
        return "Select date";
      default:
        return "Enter field value";
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case "text":
        return "Name";
      case "number":
        return "Mobile Number";
      case "date":
        return "Date";
      default:
        return "Field Type";
    }
  };

  // Check if there are any errors
  const hasErrors = errors.some((error) => error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Form Container */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Form</h1>

        {/* Add Field Section */}
        <div className="mb-6 text-center">
          <button
            onClick={handleAddField}
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600"
          >
            Add Field
          </button>
        </div>

        {/* Dynamic Fields with Labels */}
        <div>
          {fields.map((field, index) => (
            <div key={index} className="relative mb-6">
              {/* Label for the Field */}
              {field.type && (
                <label
                  className="absolute top-0 left-1 text-sm font-medium text-gray-700 bg-white px-1"
                  style={{ transform: "translateY(-50%)" }}
                >
                  {getLabel(field.type)}
                </label>
              )}

              

              {/* Input Field */}
              <div className="flex flex-col space-y-2">
                <input
                  type={field.type === "date" ? "date" : "text"}
                  placeholder={getPlaceholder(field.type)}
                  value={field.value}
                  onChange={(e) =>
                    handleFieldValueChange(index, e.target.value)
                  }
                  className={`w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors[index] ? "border-red-500" : ""
                  }`}
                />
              </div>
              {/* Dropdown for Data Type */}
              <select
                value={field.type}
                onChange={(e) => handleFieldTypeChange(index, e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>
                  Choose Data Type
                </option>
                <option value="text">Text</option>
                <option value="number">Phone Number</option>
                <option value="date">Date</option>
              </select>

              {/* Error Message */}
              {errors[index] && (
                <p className="text-red-500 text-sm mt-1">{errors[index]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        {!hasErrors && fields.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => alert("Form Saved!")}
              className="px-6 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;
