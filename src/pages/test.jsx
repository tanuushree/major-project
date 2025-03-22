import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Input, Button, Select, Option } from '@material-tailwind/react';
import { formService } from "../services/api";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"; 

const FormDetail = () => {
  const { formId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State for form details
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('');

  useEffect(() => {
    fetchFormData();
  }, []);

  // Fetch form data
  const fetchFormData = async () => {
    try {
      const data = await formService.getFormById(formId);
      setFormName(data.formName || 'Untitled Form');
      setFields(data.fields || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load form details.');
      setFormName(location.state?.formName || 'Untitled Form');
    }
  };

  // Handle field addition
  const handleAddField = () => {
    if (!fieldName || !fieldType) {
      toast.warning('Please enter both field name and type.');
      return;
    }
    setFields([...fields, { name: fieldName, type: fieldType }]);
    setFieldName('');
    setFieldType('');
  };

  // Handle field deletion
  const handleDeleteField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // Handle form saving
  const handleSave = async () => {
    try {
      await formService.saveForm(formId, { formName, fields });
      toast.success('Form saved successfully!');
    } catch (error) {
      console.error('Save form error:', error);
      toast.error('Error saving form.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Edit Form</h2>

      {/* Form Name Input */}
      <Input
        label="Form Name"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        className="mb-4 bg-gray-700 text-white"
      />

      {/* Add New Field */}
      <div className="flex space-x-2 mb-4">
        <Input
          label="Field Name"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          className="bg-gray-700 text-white"
        />
        <Select label="Select Data Type" onChange={(value) => setFieldType(value)}>
          <Option value="text">Text</Option>
          <Option value="number">Number</Option>
          <Option value="date">Date</Option>
        </Select>
        <Button color="blue" onClick={handleAddField}>
          + Add
        </Button>
      </div>

      {/* Fields List */}
      <ul className="space-y-2">
        {fields.map((field, index) => (
          <li key={index} className="flex justify-between bg-gray-700 p-2 rounded-md">
            <span>{field.name} ({field.type})</span>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDeleteField(index)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      {/* Save Form */}
      <div className="mt-6 flex space-x-4">
        <Button color="green" onClick={handleSave}>
          Save Form
        </Button>
        <Button color="red" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default FormDetail;
