// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { Button, Card, Input, Select, Option, Dialog, Alert, Spinner } from "@material-tailwind/react";

// import { formService } from "../services/api";

// function FormDetailPage() {
//   const { projectName: encodedProjectName, formId } = useParams();
//   const projectName = decodeURIComponent(encodedProjectName);
//   const navigate = useNavigate();
//   const location = useLocation();


//   const [form, setForm] = useState(null);
//   const [formName, setFormName] = useState(location.state?.formName || "");
//   const [fields, setFields] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState("");

//   const [openFieldDialog, setOpenFieldDialog] = useState(false);
//   const [fieldName, setFieldName] = useState("");
//   const [fieldType, setFieldType] = useState("");

//   // Data types for the dropdown
//   const dataTypes = ["Text", "Number", "Date", "Boolean", "Dropdown"];

//   const fetchFormData = async () => {
//     try {
//       if (!formId) {
//         setError("Form ID is required");
//         return;
//       }

//       console.log('Fetching form data for formId:', formId);
      
//       const formData = await formService.getFormById(formId);
//       setForm(formData);
//       setFormName(formData.name);
//       setFields(formData.fields || []);
//       setError(null);

//     } catch (err) {
//       if (err.response?.status !== 404) {
//         setError("Failed to fetch form data");
//         console.error('Fetch error:', err);
//       } else {
//         const newForm = {
//           id: formId,
//           name: location.state?.formName || "New Form",
//           fields: [],
//           createdAt: new Date(),
//           updatedAt: new Date()
//         };
//         setForm(newForm);
//         setFormName(location.state?.formName || "New Form");
//         setFields([]);
//       }
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (!projectName) {
//         setError("Project name is required");
//         return;
//       }

//       if (!fields || fields.length === 0) {
//         setError("Please add at least one field before saving");
//         return;
//       }

//       setSaving(true);
//       setError(null);
      
//       const formData = {
//         formId,
//         fields,
//         createdAt: form?.createdAt || new Date(),
//         updatedAt: new Date(),
//       };

//       console.log('Saving form with project name:', projectName);
//       console.log('Form data:', formData);

//       await formService.saveForm(projectName, formData);
//       setSuccessMessage("Form saved successfully!");
//       setTimeout(() => setSuccessMessage(""), 3000);
//     } catch (err) {
//       setError("Failed to save form");
//       console.error('Save error:', err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   useEffect(() => {
//     fetchFormData();
//   }, [formId]);

//   // Add a new field
//   const addField = () => {
//     if (fieldName && fieldType) {
//       setFields([...fields, { name: fieldName, type: fieldType }]);
//       setFieldName("");
//       setFieldType("");
//       setOpenFieldDialog(false);
//     }
//   };

//   return (
//     <div className="relative bg-black text-white min-h-screen">
//       <div className="pt-28 px-6 lg:px-28 space-y-6">
//         {/* Project & Form Header */}
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//           <div>
//             <h1 className="text-xl font-semibold">{projectName}</h1>
            
//           </div>
//           <Button 
//             onClick={() => navigate(`/${encodedProjectName}`)} 
//             className="text-black bg-white w-full sm:w-auto"
//           >
//             Back to Forms
//           </Button>
//         </div>
//         <div>
//           <h2 className="text-lg text-gray-300">{formName}</h2>
//         </div>

//         {error && (
//           <Alert color="red" className="mb-4" dismissible={{
//             onClose: () => setError(null)
//           }}>
//             {error}
//           </Alert>
//         )}
        
//         {successMessage && (
//           <Alert color="green" className="mb-4" dismissible={{
//             onClose: () => setSuccessMessage("")
//           }}>
//             {successMessage}
//           </Alert>
//         )}

//         <div className="flex justify-end mb-4">
//           <Button
//             onClick={handleSave}
//             className="bg-green-500 hover:bg-green-600"
//             disabled={saving}
//           >
//             {saving ? (
//               <div className="flex items-center gap-2">
//                 <Spinner className="h-4 w-4" />
//                 Saving...
//               </div>
//             ) : 'Save Form'}
//           </Button>
//         </div>

//         {/* Add Field Button */}
//         <Button onClick={() => setOpenFieldDialog(true)} className="bg-white text-black w-full sm:w-auto">
//           Add Field
//         </Button>

//         {/* Field Dialog */}
//         <Dialog open={openFieldDialog} handler={setOpenFieldDialog} size="sm">
//           <Card className="p-4 space-y-4">
//             <h2 className="text-xl font-bold">Add Field</h2>
//             <Input
//               label="Field Name"
//               value={fieldName}
//               onChange={(e) => setFieldName(e.target.value)}
//             />
//             <Select label="Select Data Type" onChange={(val) => setFieldType(val)}>
//               {dataTypes.map((type, i) => (
//                 <Option key={i} value={type}>
//                   {type}
//                 </Option>
//               ))}
//             </Select>
//             <Button onClick={addField} className="bg-black text-white">
//               Add Field
//             </Button>
//           </Card>
//         </Dialog>

//         {/* Fields List */}
//         <div className="bg-gray-800 p-4 rounded-lg">
//           {fields.length > 0 ? (
//             <ul className="space-y-2">
//               {fields.map((field, index) => (
//                 <li key={index} className="flex justify-between bg-gray-700 p-2 rounded-md">
//                   <span>{field.name}</span>
//                   <span className="text-sm text-gray-300">{field.type}</span>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-400 text-center">No fields added yet.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default FormDetailPage;
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
    if (!projectName) {
      setError("Project name is required");
      return;
    }

    if (!fields || fields.length === 0) {
      setError("Please add at least one field before saving");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = {
        formId,
        fields,
        createdAt: form?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      console.log("Saving form:", formData);
      await formService.saveForm(projectName, formData);
      
      setSuccessMessage("Form saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to save form");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, [formId, projectName]);

  return (
    <div className="relative bg-black text-white min-h-screen">
      <div className="pt-28 px-6 lg:px-28 space-y-6">
        {/* Project & Form Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">{projectName}</h1>
          </div>
          <Button 
            onClick={() => navigate(`/${encodedProjectName}`)} 
            className="text-black bg-white w-full sm:w-auto"
          >
            Back to Forms
          </Button>
        </div>
        <div>
          <h2 className="text-lg text-gray-300">{formName}</h2>
        </div>

        {error && (
          <Alert color="red" className="mb-4" dismissible={{ onClose: () => setError(null) }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert color="green" className="mb-4" dismissible={{ onClose: () => setSuccessMessage("") }}>
            {successMessage}
          </Alert>
        )}

        <div className="flex justify-end mb-4">
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

        {/* Field Dialog */}
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
            <Button onClick={() => {
              if (fieldName && fieldType) {
                setFields([...fields, { name: fieldName, type: fieldType }]);
                setFieldName("");
                setFieldType("");
                setOpenFieldDialog(false);
              }
            }} className="bg-black text-white">
              Add Field
            </Button>
          </Card>
        </Dialog>

        {/* Fields List */}
        <div className="bg-gray-800 p-4 rounded-lg">
          {fields.length > 0 ? (
            <ul className="space-y-2">
              {fields.map((field, index) => (
                <li key={index} className="flex justify-between bg-gray-700 p-2 rounded-md">
                  <span>{field.name}</span>
                  <span className="text-sm text-gray-300">{field.type}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No fields added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormDetailPage;
