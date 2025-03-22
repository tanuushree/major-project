import React, { useState, useEffect } from "react";
import { Button, Card, Input, Dialog, Alert, Spinner } from "@material-tailwind/react";
import { useParams, useNavigate } from "react-router-dom";
import { formService } from "../services/api";

function FormsPage() {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formName, setFormName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const projectId = localStorage.getItem('currentProjectId');

  // Helper function to format project name
  const formatProjectName = (name) => {
    return name.replace(/\s+/g, '_');
  };

  useEffect(() => {
    if (!projectId) {
      setError("Project ID not found. Please go back to projects page.");
      setLoading(false);
      return;
    }
    fetchForms();
  }, [projectId]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await formService.getForms(projectId);
      setForms(response || []);
      setError("");
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError(err.error || "Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  const createForm = async () => {
    if (!formName.trim()) {
      setError("Form name is required");
      return;
    }

    try {
      setCreating(true);
      setError("");
      
      const formData = {
        name: formName.trim(),
        projectId: localStorage.getItem('currentProjectId'),
        fields: []
      };

      const newForm = await formService.createForm(formData);
      setForms([...forms, newForm]);
      setFormName("");
      setOpenDialog(false);

      // Navigate to the new form with its name
      const encodedProjectName = encodeURIComponent(projectName);
      navigate(`/${encodedProjectName}/${newForm.id}`, {
        state: { formName: newForm.name }  // Pass form name in navigation state
      });
    } catch (err) {
      console.error("Error creating form:", err);
      setError(err.error || "Failed to create form");
    } finally {
      setCreating(false);
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
        {/* Project Name Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">{projectName}</h1>
          <Button onClick={() => navigate("/projects")} className="text-black bg-white w-full sm:w-auto">
            Back to Projects
          </Button>
        </div>

        {error && (
          <Alert color="red" className="mb-4" dismissible={{
            onClose: () => setError(null)
          }}>
            {error}
          </Alert>
        )}

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
            <Button 
              onClick={createForm} 
              className="bg-black text-white"
              disabled={creating}
            >
              {creating ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Creating...
                </div>
              ) : 'Create'}
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
            forms.map((form) => (
              <div
                key={form.id}
                className="flex justify-between py-2 border-b border-gray-700 text-gray-300"
              >
                <span className="w-1/4">{form.name}</span>
                <span className="w-1/4">{form.id}</span>
                <span className="w-1/4">{new Date(form.createdAt).toLocaleString()}</span>
                <span className="w-1/4 text-center">
                  <button
                    onClick={() => navigate(`/${formatProjectName(projectName)}/${form.id}`, {
                      state: { formName: form.name,
                               formId: form.id
                       }  // Pass the form name in navigation state
                    })}
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
