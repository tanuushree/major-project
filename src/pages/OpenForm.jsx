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
import { toast } from "react-hot-toast";

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
  const [fieldOptions, setFieldOptions] = useState({});
  const [referenceFieldOptions, setReferenceFieldOptions] = useState({});
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

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
          field.type.toLowerCase() === "form reference" && field.form_name !== null
        );
        
        console.log("Found reference fields:", referenceFields);
        const referenceValues = {};
        
        for (const field of referenceFields) {
          try {
            console.log(`Fetching values for reference form Name: ${field.form_name}`);
            const values = await submissionService.getFieldSubmissions();
            console.log(`API Response for ${field.label}:`, values);
            console.log(field.form_name);
            
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

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Internet connection restored');
      processPendingSubmissions(); // Directly call here instead of relying on state change
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('Internet connection lost');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Process any pending submissions when component mounts and is online
    if (window.navigator.onLine) {
      processPendingSubmissions();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Empty dependency array since we want this to run only on mount

  const saveToLocalStorage = (submissionData) => {
    const pendingSubmissions = JSON.parse(localStorage.getItem('pendingFormSubmissions') || '[]');
    pendingSubmissions.push(submissionData);
    localStorage.setItem('pendingFormSubmissions', JSON.stringify(pendingSubmissions));
  };

  const processPendingSubmissions = async () => {
    const pendingSubmissions = JSON.parse(localStorage.getItem('pendingFormSubmissions') || '[]');
    console.log('Processing pending submissions:', pendingSubmissions);
    
    if (pendingSubmissions.length === 0) {
      console.log('No pending submissions found');
      return;
    }

    let successCount = 0;
    for (let i = pendingSubmissions.length - 1; i >= 0; i--) {
      try {
        console.log(`Attempting to submit pending form ${i + 1}/${pendingSubmissions.length}`);
        await formService.submitFormResponse(pendingSubmissions[i]);
        successCount++;
        pendingSubmissions.splice(i, 1);
        localStorage.setItem('pendingFormSubmissions', JSON.stringify(pendingSubmissions));
        toast.success(`Successfully submitted pending form ${i + 1}`);
      } catch (err) {
        console.error('Failed to submit pending form:', err);
        toast.error(`Failed to submit pending form ${i + 1}`);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully submitted ${successCount} pending form(s)`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const submissionData = {
      form_id: formId,
      data: formData,
    };

    if (!isOnline) {
      saveToLocalStorage(submissionData);
      toast.success('Form saved offline. Will be submitted when internet connection is restored.');
      setSubmitted(true);
      setSubmitting(false);
      return;
    }

    try {
      console.log("Submitting data:", submissionData);
      await formService.submitFormResponse(submissionData);
      
      await processPendingSubmissions();

      toast.success("Form submitted successfully!");
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.message || "Failed to submit form");
      
      saveToLocalStorage(submissionData);
      toast.warning('Form saved offline. Will be submitted when internet connection is restored.');
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

  const fetchFieldValues = async (formName, fieldLabel) => {
    try {
      console.log(`Fetching values for ${formName}, field: ${fieldLabel}`);
      const response = await submissionService.getFieldSubmissions(formName, fieldLabel);
      console.log('Field values response:', response);
      
      setFieldOptions(prev => ({
        ...prev,
        [fieldLabel]: response
      }));
    } catch (error) {
      console.error(`Error fetching field values for ${formName}:`, error);
      toast.error(`Failed to load options for ${fieldLabel}`);
    }
  };

  useEffect(() => {
    const loadReferenceFields = async () => {
      const referenceFields = fields.filter(field => field.type === "Form Reference");
      
      for (const field of referenceFields) {
        if (field.form_name) {
          await fetchFieldValues(field.form_name, field.label);
        }
      }
    };

    if (fields.length > 0) {
      loadReferenceFields();
    }
  }, [fields]);

  useEffect(() => {
    const fetchReferenceFieldOptions = async () => {
      if (!fields) return;

      const referenceFields = fields.filter(field => 
        field.type.toLowerCase() === 'form reference' && field.form_name
      );
      
      const optionsMap = {};
      for (const field of referenceFields) {
        try {
          console.log(`Fetching options for form: ${field.form_name}, field: ${field.label}`);
          const submissions = await submissionService.getFieldSubmissions({
            formName: field.form_name,
            fieldName: field.label
          });
          console.log('Received reference field submissions:', submissions);
          
          optionsMap[field.label] = submissions || [];
        } catch (error) {
          console.error(`Error fetching options for ${field.label}:`, error);
          optionsMap[field.label] = [];
        }
      }

      console.log('Final options map:', optionsMap);
      setReferenceFieldOptions(optionsMap);
    };

    fetchReferenceFieldOptions();
  }, [fields]);

  const renderField = (field) => {
    if (field.type.toLowerCase() === 'form reference' && field.form_name) {
      const options = referenceFieldOptions[field.label] || [];
      console.log(`Rendering options for ${field.label}:`, options);
      
      return (
        <div key={field.label} className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {Array.isArray(options) && options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // If submitted and not editing, show the value as text
    if (submitted && !editingField) {
      return (
        <div className="text-white">
          <span className="font-medium">{field.label}: </span>
          {formData[field.label]}
        </div>
      );
    }

    // For editing or new entry
    switch (field.type.toLowerCase()) {
      case "boolean":
        return (
          <Checkbox
            label={field.label}
            checked={formData[field.label] || false}
            onChange={(e) => handleInputChange(field.label, e.target.checked)}
            disabled={submitted && !editingField}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            label={field.label}
            value={formData[field.label] || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
            className="text-white bg-gray-800 border-gray-600"
            disabled={submitted && !editingField}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            label={field.label}
            value={formData[field.label] || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
            className="text-white bg-gray-800 border-gray-600"
            disabled={submitted && !editingField}
          />
        );

      default: // text
        return (
          <Input
            type="text"
            label={field.label}
            value={formData[field.label] || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
            className="text-white bg-gray-800 border-gray-600"
            disabled={submitted && !editingField}
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
            {fields.map((field) => (
              <div key={field.label} className="space-y-2">
                {renderField(field)}
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
