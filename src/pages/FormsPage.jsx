import React, { useState } from "react";
import { Button, Card, Input, Dialog } from "@material-tailwind/react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs

function FormsPage() {
  const { projectName } = useParams(); // Get project name from URL
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formName, setFormName] = useState("");

  const createForm = () => {
    if (formName) {
      const timestamp = new Date().toLocaleString(); // Store creation time
      const formId = `${projectName}-${uuidv4().slice(0, 8)}`; // Unique ID with project prefix
      setForms([...forms, { name: formName, id: formId, createdAt: timestamp }]);
      setFormName("");
      setOpenDialog(false);
    }
  };

  return (
    <div className="relative bg-black text-white min-h-screen">
      <div className="pt-28 px-6 lg:px-28 space-y-6">
        {/* Project Name Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">{projectName}</h1>
          <Button onClick={() => navigate("/")} className="text-black bg-white w-full sm:w-auto">
            Back to Projects
          </Button>
        </div>

        {/* Create Form Button */}
        <Button onClick={() => setOpenDialog(true)} className="bg-white text-black w-full sm:w-auto">
          Create New Form
        </Button>

        {/* Create Form Dialog */}
        <Dialog open={openDialog} handler={setOpenDialog} size="sm">
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Create New Form</h2>
            <Input
              label="Form Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <Button onClick={createForm} className="bg-black text-white">
              Create
            </Button>
          </Card>
        </Dialog>

        {/* Forms List View */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2">Forms List</h2>
          <div className="border-b border-gray-600 pb-2 mb-2 flex justify-between font-semibold">
            <span className="w-1/4">Form Name</span>
            <span className="w-1/4">ID</span>
            <span className="w-1/4">Created At</span>
            <span className="w-1/4 text-center">Actions</span>
          </div>
          {forms.length > 0 ? (
            forms.map((form, index) => (
              <div
                key={index}
                className="flex justify-between py-2 border-b border-gray-700 text-gray-300"
              >
                <span className="w-1/4">{form.name}</span>
                <span className="w-1/4">{form.id}</span>
                <span className="w-1/4">{form.createdAt}</span>
                <span className="w-1/4 text-center">
                  <button
                    onClick={() => navigate(`/form/${form.id}`)}
                    className="text-white underline hover:text-blue-300"
                  >
                    Open
                  </button>
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No forms created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormsPage;
