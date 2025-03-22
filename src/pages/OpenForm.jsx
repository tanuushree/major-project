import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { formService } from "@/services/api";
import {
  Card,
  Typography,
  Button,
  Input,
  Spinner,
  Alert,
  Checkbox,
} from "@material-tailwind/react";

function OpenForm() {
  const { projectName: encodedProjectName, formId } = useParams();
  const projectName = decodeURIComponent(encodedProjectName);

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        setLoading(true);
        const fieldsData = await formService.getFieldsByForm(formId);
        console.log("Fetched fields:", fieldsData);

        if (fieldsData) {
          setFields(fieldsData);
          const initialData = {};
          fieldsData.forEach((field) => {
            initialData[field.label] = "";
          });
          setFormData(initialData);
        }
      } catch (err) {
        console.error("Error fetching fields:", err);
        setError("Failed to load form fields");
      } finally {
        setLoading(false);
      }
    };

    fetchFormFields();
  }, [formId]);

  const handleInputChange = (fieldLabel, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldLabel]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const submissionData = {
        form_id: formId,
        data: formData,
      };

      console.log("Submitting data:", submissionData);
      await formService.submitFormResponse(submissionData);

      alert("Form submitted successfully!");

      // Mark fields as read-only
      setFields((prevFields) =>
        prevFields.map((field) => ({ ...field, readOnly: true }))
      );

    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    return (
      <Input
        type={field.type.toLowerCase() === "number" ? "number" : "text"}
        label={field.label}
        value={formData[field.label] || ""}
        onChange={(e) => handleInputChange(field.label, e.target.value)}
        required={field.required}
        className={`text-white bg-gray-800 border-gray-600 ${
          field.readOnly ? "cursor-default opacity-100" : ""
        }`}
        labelProps={{ className: "text-white" }}
        style={{
          backgroundColor: "#1F2937", // Dark gray (Tailwind gray-800)
          borderColor: "#4B5563", // Border color (Tailwind gray-600)
          color: "white", // Keep text white
          cursor: field.readOnly ? "default" : "text",
        }}
        disabled={field.readOnly} // Read-only after submission
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-12 w-12" color="white" />
      </div>
    );
  }

  return (
    <div className="relative bg-black text-white min-h-screen">
      <div className="pt-28 px-6 lg:px-28 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h4" className="text-white">
              {projectName}
            </Typography>
            <Typography className="text-gray-400">Form Submission</Typography>
          </div>
        </div>

        {error && (
          <Alert
            color="red"
            className="mb-4"
            dismissible={{ onClose: () => setError(null) }}
          >
            {error}
          </Alert>
        )}

        {/* Form */}
        <Card className="bg-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field, index) => (
              <div key={index} className="space-y-2">
                {renderField(field)}
                {field.is_primary_key && (
                  <Typography className="text-xs text-blue-500">
                    Primary Key Field
                  </Typography>
                )}
              </div>
            ))}

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Form"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default OpenForm;
