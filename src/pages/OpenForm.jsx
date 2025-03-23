import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { formService } from "@/services/api";
import { submissionService } from '@/services/api';
import {
  Card,
  Typography,
  Button,
  Input,
  Spinner,
  Alert,
  Checkbox,
  Select,
  Option,
} from "@material-tailwind/react";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

function OpenForm() {
  const { projectName: encodedProjectName, formId } = useParams();
  const projectName = decodeURIComponent(encodedProjectName);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get formName from location state
  const formName = location.state?.formName || "Form";

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [referenceFormValues, setReferenceFormValues] = useState({});
  const [referenceFieldValues, setReferenceFieldValues] = useState({});

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

  useEffect(() => {
    const loadReferenceValues = async () => {
      try {
        // console.log("All fields:", fields);
        // Change the filter condition to match exactly "Form Reference"
        const referenceFields = fields.filter(field => 
          field.type.toLowerCase() === "form reference"     
        );
        
        console.log("Found reference fields:", referenceFields);
        // const referenceValues = {};
        
        for (const field of referenceFields) {
          try {
            console.log(`Fetching values for reference form ID: ${field.reference_form_id}`);
            const values = await submissionService.getSubmissionByPrimaryKey(field.reference_form_id);
            console.log(`API Response for ${field.label}:`, values);
            
            if (Array.isArray(values)) {
              referenceValues[field.label] = values;
            } else {
              console.warn(`Unexpected API response format for ${field.label}:`, values);
              referenceValues[field.label] = [];
            }
          } catch (err) {
            console.error(`Error fetching values for ${field.label}:`, err);
            referenceValues[field.label] = [];
          }
        }
        
        console.log("Setting reference values:", referenceValues);
        setReferenceFormValues(referenceValues);
      } catch (err) {
        console.error("Error in loadReferenceValues:", err);
      }
    };

    if (fields.length > 0) {
      loadReferenceValues();
    }
  }, [fields]);

  const fetchReferenceFieldValue = async (formId, primaryKeyValue) => {
    try {
      const response = await submissionService.getSubmissionByPrimaryKey(formId, primaryKeyValue);
      console.log('Reference field response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching reference field:', error);
      return null;
    }
  };

  const handleInputChange = async (fieldName, value) => {
    const field = fields.find(f => f.label === fieldName);
    
    if (field?.type === "Form Reference" && value) {
      try {
        const referenceData = await fetchReferenceFieldValue(field.reference_form_id, value);
        setReferenceFieldValues(prev => ({
          ...prev,
          [fieldName]: referenceData
        }));
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: value
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
      setSubmitted(true);

    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (fieldLabel) => {
    setEditingField(fieldLabel);
    setEditValue(formData[fieldLabel]);
  };

  const handleSaveEdit = async (fieldLabel) => {
    try {
      // Here you would typically make an API call to update the field
      // await formService.updateFieldSubmission(formId, fieldLabel, editValue);
      
      setFormData(prev => ({
        ...prev,
        [fieldLabel]: editValue
      }));
      setEditingField(null);
    } catch (err) {
      console.error("Error updating field:", err);
      setError("Failed to update field");
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const renderField = (field) => {
    console.log("Rendering field:", field);
    console.log("Current referenceFormValues:", referenceFormValues);

    const isEditing = editingField === field.label;

    if (submitted && !isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            type={field.type.toLowerCase() === "number" ? "number" : "text"}
            label={field.label}
            value={formData[field.label] || ""}
            className="text-white bg-gray-800 border-gray-600"
            labelProps={{ className: "text-white" }}
            style={{
              backgroundColor: "#1F2937",
              borderColor: "#4B5563",
              color: "white",
            }}
            disabled
          />
          <Button
            className="p-2 bg-blue-500 hover:bg-blue-600"
            onClick={() => handleEdit(field.label)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            type={field.type.toLowerCase() === "number" ? "number" : "text"}
            label={field.label}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="text-white bg-gray-800 border-gray-600"
            labelProps={{ className: "text-white" }}
            style={{
              backgroundColor: "#1F2937",
              borderColor: "#4B5563",
              color: "white",
            }}
          />
          <Button
            className="p-2 bg-green-500 hover:bg-green-600"
            onClick={() => handleSaveEdit(field.label)}
          >
            <CheckIcon className="h-4 w-4" />
          </Button>
          <Button
            className="p-2 bg-red-500 hover:bg-red-600"
            onClick={handleCancelEdit}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    switch (field.type) {
      case "Form Reference":
        console.log(`Rendering Form Reference field: ${field.label}`);
        console.log(`Reference form ID: ${field.reference_form_id}`);
        console.log(`Available values:`, referenceFormValues[field.label]);
        
        return (
          <div className="w-full">
            <Select
              key={field.label}
              label={field.label}
              value={formData[field.label] || ""}
              onChange={(value) => {
                console.log("Selected value:", value);
                handleInputChange(field.label, value);
              }}
              required={field.required}
              className="text-white bg-gray-800 border-gray-600"
              labelProps={{ className: "text-white" }}
            >
              {(referenceFormValues[field.label] || []).map((item) => (
                <Option 
                  key={item.id || item.primary_key_value} 
                  value={item.primary_key_value}
                  className="text-gray-900"
                >
                  {item.primary_key_value}
                </Option>
              ))}
            </Select>
            {referenceFieldValues[field.label] && (
              <div className="mt-2 text-sm text-gray-500">
                Reference Details: {JSON.stringify(referenceFieldValues[field.label])}
              </div>
            )}
          </div>
        );

      default:
        return (
          <Input
            type={field.type.toLowerCase() === "number" ? "number" : "text"}
            label={field.label}
            value={formData[field.label] || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
            className="text-white bg-gray-800 border-gray-600"
            labelProps={{ className: "text-white" }}
            style={{
              backgroundColor: "#1F2937",
              borderColor: "#4B5563",
              color: "white",
            }}
          />
        );
    }
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
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h4" className="text-white">
              {formName}
            </Typography>
            <Typography className="text-gray-400">
              Project: {projectName}
            </Typography>
          </div>
          <Button
            onClick={() => navigate(`/project/${encodedProjectName}/form/${formId}/submissions`)}
            className="bg-white text-black"
          >
            Back to Submissions
          </Button>
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
              <div key={`${field.label}-${index}`} className="space-y-2">
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
