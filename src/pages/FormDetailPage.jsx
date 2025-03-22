import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Card, Input, Select, Option, Dialog, Alert, Spinner } from "@material-tailwind/react";
import { formService } from "../services/api";

function FormDetailPage() {
  const { projectName: encodedProjectName, formId } = useParams();
  const projectName = decodeURIComponent(encodedProjectName);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(null);
  const [formName, setFormName] = useState(location.state?.formName || "");
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [isPrimaryKey, setIsPrimaryKey] = useState(false);
  const [isRequired, setIsRequired] = useState(true);

  const [editingField, setEditingField] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // Data types for the dropdown
  const dataTypes = ["Text", "Number", "Date", "Boolean", "Dropdown"];

  const fetchFormData = async () => {
    if (!formId || !projectName) {
      setError("Form ID and Project Name are required");
      return;
    }

    try {
      console.log(`Fetching form data for formId: ${formId} in project: ${projectName}`);

      const formData = await formService.getFormById(formId, projectName);

      if (formData) {
        setForm(formData);
        setFormName(formData.name);
        setFields(formData.fields || []);
      } else {
        setError("No form data found.");
      }
    } catch (err) {
      setError("Failed to fetch form data");
      console.error("Fetch error:", err);
    }
  };

  const handleSave = async () => {
    if (!formId) {
      setError("Form ID is required");
      return;
    }

    if (!fields || fields.length === 0) {
      setError("Please add at least one field before saving");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const fieldsData = fields.map(field => ({
        label: field.label,
        type: field.type.toLowerCase(),
        required: field.required,
        is_primary_key: field.is_primary_key
      }));

      const response = await formService.saveForm(formId, fieldsData);
      console.log("Form saved successfully:", response);
      setSuccessMessage("Form saved successfully!");
      
      if (response.fields) {
        setFields(response.fields);
      }
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to save form");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditField = (field, index) => {
    setEditingField({ ...field, index });
    setFieldName(field.label);
    setFieldType(field.type.toUpperCase());
    setIsRequired(field.required);
    setIsPrimaryKey(field.is_primary_key);
    setEditDialogOpen(true);
  };

  const handleUpdateField = () => {
    if (!fieldName || !fieldType) return;

    const updatedFields = [...fields];
    updatedFields[editingField.index] = {
      ...editingField,
      label: fieldName,
      type: fieldType.toLowerCase(),
      required: isRequired,
      is_primary_key: isPrimaryKey
    };

    setFields(updatedFields);
    setFieldName("");
    setFieldType("");
    setIsRequired(true);
    setIsPrimaryKey(false);
    setEditingField(null);
    setEditDialogOpen(false);
  };

  const handleDeleteField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const handleOpenForm = () => {
    navigate(`/${encodedProjectName}/forms/${formId}/open`);
  };

  useEffect(() => {
    const fetchFormFields = async () => {
      if (!formId) {
        setError("Form ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fieldsData = await formService.getFieldsByForm(formId);
        console.log("Fetched fields:", fieldsData);
        
        if (fieldsData) {
          // Transform the fields data to match your form's format
          const transformedFields = fieldsData.map(field => ({
            label: field.label,
            type: field.type,
            required: field.required,
            is_primary_key: field.is_primary_key,
            order: field.order
          }));
          
          setFields(transformedFields);
        }
      } catch (err) {
        console.error("Error fetching fields:", err);
        if (err.response?.status === 404) {
          // If no fields found, just set empty array
          setFields([]);
        } else {
          setError("Failed to load form fields");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormFields();
  }, [formId]);

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
        {/* Project & Form Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">{projectName}</h1>
            <h2 className="text-lg text-gray-300">{formName}</h2>
          </div>
          <Button 
            onClick={() => navigate(`/${encodedProjectName}`)} 
            className="text-black bg-white w-full sm:w-auto"
          >
            Back to Forms
          </Button>
        </div>

        {error && (
          <Alert color="red" className="mb-4" dismissible={{
            onClose: () => setError(null)
          }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert color="green" className="mb-4" dismissible={{ onClose: () => setSuccessMessage("") }}>
            {successMessage}
          </Alert>
        )}

        <div className="flex justify-end mb-4 gap-4">
          <Button
            onClick={handleOpenForm}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Open Form
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600"
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Saving...
              </div>
            ) : 'Save Form'}
          </Button>
        </div>

        {/* Add Field Button */}
        <Button onClick={() => setOpenFieldDialog(true)} className="bg-white text-black w-full sm:w-auto">
          Add Field
        </Button>

        {/* Fields List with Edit/Delete */}
        <div className="bg-gray-800 p-4 rounded-lg">
          {fields.length > 0 ? (
            <ul className="space-y-2">
              {fields.map((field, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <span>{field.label}</span>
                    {field.is_primary_key && (
                      <span className="text-xs bg-blue-500 px-2 py-0.5 rounded">
                        Primary Key
                      </span>
                    )}
                    {field.required && (
                      <span className="text-xs bg-red-500 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{field.type}</span>
                    <Button
                      size="sm"
                      className="bg-blue-500 p-2"
                      onClick={() => handleEditField(field, index)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-500 p-2"
                      onClick={() => handleDeleteField(index)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No fields added yet.</p>
          )}
        </div>

        {/* Edit Field Dialog */}
        <Dialog open={editDialogOpen} handler={setEditDialogOpen} size="sm">
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Edit Field</h2>
            <Input
              label="Field Name"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
            <Select 
              label="Select Data Type" 
              value={fieldType}
              onChange={(val) => setFieldType(val)}
            >
              {dataTypes.map((type, i) => (
                <Option key={i} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editRequired"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="editRequired" className="text-sm">
                  Required Field
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editPrimaryKey"
                  checked={isPrimaryKey}
                  onChange={(e) => setIsPrimaryKey(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="editPrimaryKey" className="text-sm">
                  Is Primary Key
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setEditDialogOpen(false)}
                className="bg-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateField}
                className="bg-blue-500"
              >
                Update Field
              </Button>
            </div>
          </Card>
        </Dialog>

        {/* Modified Field Dialog */}
        <Dialog open={openFieldDialog} handler={setOpenFieldDialog} size="sm">
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Add Field</h2>
            <Input
              label="Field Name"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
            <Select label="Select Data Type" onChange={(val) => setFieldType(val)}>
              {dataTypes.map((type, i) => (
                <Option key={i} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
            
            <div className="flex flex-col gap-2">
              {/* Required Field Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-sm">
                  Required Field
                </label>
              </div>

              {/* Primary Key Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primaryKey"
                  checked={isPrimaryKey}
                  onChange={(e) => setIsPrimaryKey(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="primaryKey" className="text-sm">
                  Is Primary Key
                </label>
              </div>
            </div>

            <Button 
              onClick={() => {
                if (fieldName && fieldType) {
                  setFields([
                    ...fields,
                    {
                      label: fieldName,
                      type: fieldType.toLowerCase(),
                      required: isRequired,
                      is_primary_key: isPrimaryKey,
                      order: fields.length + 1,
                      form_id: formId
                    }
                  ]);
                  setFieldName("");
                  setFieldType("");
                  setIsPrimaryKey(false);
                  setIsRequired(true);
                  setOpenFieldDialog(false);
                }
              }} 
              className="bg-black text-white"
            >
              Add Field
            </Button>
          </Card>
        </Dialog>
      </div>
    </div>
  );
}

export default FormDetailPage;
