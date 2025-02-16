import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Input, Select, Option, Dialog } from "@material-tailwind/react";

function FormDetailPage() {
  const { projectName, formId } = useParams(); // Get project and form ID from URL
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [openSectionDialog, setOpenSectionDialog] = useState(false);
  const [sectionName, setSectionName] = useState("");

  const [openFieldDialog, setOpenFieldDialog] = useState(null); // Track which section is adding a field
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("");

  // Data types for the dropdown
  const dataTypes = ["Text", "Number", "Date", "Boolean", "Dropdown"];

  // Add a new section
  const createSection = () => {
    if (sectionName) {
      setSections([...sections, { name: sectionName, fields: [] }]);
      setSectionName("");
      setOpenSectionDialog(false);
    }
  };

  // Add a field to a section
  const addFieldToSection = (index) => {
    if (fieldName && fieldType) {
      const updatedSections = [...sections];
      updatedSections[index].fields.push({ name: fieldName, type: fieldType });
      setSections(updatedSections);
      setFieldName("");
      setFieldType("");
      setOpenFieldDialog(null);
    }
  };

  return (
    <div className="relative bg-black text-white min-h-screen">
      <div className="pt-28 px-6 lg:px-28 space-y-6">
        {/* Project & Form Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl font-semibold">{projectName}</h1>
          <Button onClick={() => navigate(-1)} className="text-black bg-white w-full sm:w-auto">
            Back to Forms
          </Button>
        </div>

        {/* Form Name (Emphasized) */}
        <h2 className="text-3xl font-bold text-center py-4">{formId}</h2>

        {/* Create Section Button */}
        <Button onClick={() => setOpenSectionDialog(true)} className="bg-white text-black w-full sm:w-auto">
          Add Section
        </Button>

        {/* Section Dialog */}
        <Dialog open={openSectionDialog} handler={setOpenSectionDialog} size="sm">
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Add Section</h2>
            <Input
              label="Section Name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
            <Button onClick={createSection} className="bg-black text-white">
              Create Section
            </Button>
          </Card>
        </Dialog>

        {/* Sections List */}
        {sections.map((section, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg space-y-4">
            {/* Section Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{section.name}</h3>
              <Button
                onClick={() => setOpenFieldDialog(index)}
                className="bg-gray-300 text-black text-sm"
              >
                Add Field
              </Button>
            </div>

            {/* Field Dialog */}
            {openFieldDialog === index && (
              <Dialog open={openFieldDialog !== null} handler={() => setOpenFieldDialog(null)} size="sm">
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
                  <Button onClick={() => addFieldToSection(index)} className="bg-black text-white">
                    Add Field
                  </Button>
                </Card>
              </Dialog>
            )}

            {/* Fields List */}
            {section.fields.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {section.fields.map((field, fieldIndex) => (
                  <li key={fieldIndex} className="flex justify-between bg-gray-700 p-2 rounded-md">
                    <span>{field.name}</span>
                    <span className="text-sm text-gray-300">{field.type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No fields added yet.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FormDetailPage;
