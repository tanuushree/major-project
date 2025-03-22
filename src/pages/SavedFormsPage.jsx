import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Spinner,
  Alert,
} from "@material-tailwind/react";
import api from "../services/api";

export function SavedFormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllForms();
  }, []);

  const fetchAllForms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/forms');
      setForms(response.data);
    } catch (err) {
      setError("Failed to fetch forms");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h2">Saved Forms</Typography>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      {error && (
        <Alert color="red" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <Card key={form.id} className="p-4">
            <Typography variant="h5" className="mb-2">
              {form.name}
            </Typography>
            <Typography color="gray" className="mb-4">
              Project: {form.projectName}
            </Typography>
            <div className="mb-4">
              <Typography variant="h6">Sections:</Typography>
              {form.sections?.map((section, idx) => (
                <div key={idx} className="ml-4 mt-2">
                  <Typography variant="h6" className="text-blue-gray-800">
                    {section.name}
                  </Typography>
                  <ul className="list-disc ml-4">
                    {section.fields?.map((field, fieldIdx) => (
                      <li key={fieldIdx}>
                        {field.name} ({field.type})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                color="blue"
                size="sm"
                onClick={() => navigate(`/form/${form.id}`)}
              >
                Edit
              </Button>
              <Button
                color="red"
                size="sm"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this form?')) {
                    try {
                      await api.delete(`/forms/${form.id}`);
                      setForms(forms.filter(f => f.id !== form.id));
                    } catch (err) {
                      setError("Failed to delete form");
                    }
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {forms.length === 0 && (
        <div className="text-center py-8">
          <Typography>No forms saved yet.</Typography>
        </div>
      )}
    </div>
  );
} 