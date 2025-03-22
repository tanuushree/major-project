import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Select, Option, Button, Card, Typography, Spinner } from "@material-tailwind/react";
import { formService } from "../services/api";

export function Analytics() {
  const { projectId } = useParams();
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [response, setResponse] = useState("");
  const [formFields, setFormFields] = useState(null);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState("");

  // Fetch forms when component mounts
  useEffect(() => {
    const fetchForms = async () => {
      setLoadingForms(true);
      try {
        const data = await formService.getForms(projectId);
        setForms(data);
      } catch (err) {
        console.error("Error fetching forms:", err);
        setError("Failed to fetch forms.");
      } finally {
        setLoadingForms(false);
      }
    };

    fetchForms();
  }, [projectId]);

  // Fetch form fields using the correct function name
  const fetchFormFields = async () => {
    if (!selectedForm) return setError("Please select a form.");
    setError("");
    setLoadingFields(true);

    try {
      const fields = await formService.getFieldsByForm(selectedForm);  // Updated function name
      setFormFields(fields);
    } catch (err) {
      console.error("Error fetching form fields:", err);
      setError("Failed to fetch form fields.");
    } finally {
      setLoadingFields(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <Typography variant="h4" className="text-white text-left mb-4">
        Project Analytics
      </Typography>

      <Card className="w-full max-w-2xl bg-gray-900 p-6 rounded-lg shadow-lg">
        <Typography className="text-gray-300 mb-2">Select a Form:</Typography>
        <Select
          label="Select Form"
          className="bg-gray-800 text-white border-gray-700"
          onChange={(value) => setSelectedForm(value)}
        >
          {forms.map((form) => (
            <Option key={form.id} value={form.id}>
              {form.name}
            </Option>
          ))}
        </Select>

        <Button
          className="mt-4 bg-white text-black w-full rounded-lg hover:bg-gray-300"
          onClick={fetchFormFields}
          disabled={loadingFields}
        >
          {loadingFields ? <Spinner className="h-5 w-5" /> : "Fetch Form Fields"}
        </Button>

        {error && <Typography className="text-red-500 mt-4">{error}</Typography>}

        {formFields && (
          <Card className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md">
            <Typography variant="h6" className="text-white">Form Fields JSON:</Typography>
            <pre className="text-gray-400 text-sm overflow-x-auto">{JSON.stringify(formFields, null, 2)}</pre>
          </Card>
        )}
      </Card>
    </div>
  );
}

export default Analytics;
