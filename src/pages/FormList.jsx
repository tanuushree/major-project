import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Typography, Button, Card, Spinner, Alert } from "@material-tailwind/react";
import { formService } from "../services/api";

function FormList() {
  const { projectName: encodedProjectName, formId } = useParams();
  const projectName = decodeURIComponent(encodedProjectName);
  const location = useLocation();
  const navigate = useNavigate();
  const formName = location.state?.formName || 'Form';

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await formService.getFormSubmissions(formId);
        console.log('Submissions fetched:', response);
        setSubmissions(response);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [formId]);

  const handleViewEntry = (submissionId) => {
    navigate(`/project/${encodedProjectName}/form/${formId}/entry/${submissionId}`, {
      state: { 
        formName: formName,
        submissionId: submissionId
      }
    });
  };

  const handleAddEntry = () => {
    navigate(`/project/${encodedProjectName}/form/${formId}/open-form`, {
      state: { formName: formName }
    });
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
          <div className="flex gap-4">
            <Button
              onClick={handleAddEntry}
              className="bg-green-500 hover:bg-green-600"
            >
              Add Entry
            </Button>
            <Button
              onClick={() => navigate(`/project/${encodedProjectName}/form/${formId}`)}
              className="bg-white text-black"
            >
              Back to Form
            </Button>
          </div>
        </div>

        {error && (
          <Alert color="red" dismissible={{ onClose: () => setError(null) }}>
            {error}
          </Alert>
        )}

        <Card className="bg-gray-800 p-6">
          {submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission) => {
                // Get first two field values from submission data
                const data = submission.data || {};
                const fieldEntries = Object.entries(data);
                const firstTwoFields = fieldEntries.slice(0, 2);

                return (
                  <div
                    key={submission.id}
                    className="flex justify-between items-center bg-gray-700 p-4 rounded-lg"
                  >
                    <div className="space-y-1">
                      {firstTwoFields.map(([fieldName, value], index) => (
                        <Typography 
                          key={fieldName} 
                          className={index === 0 ? "text-white" : "text-gray-400"}
                        >
                          {fieldName}: {value}
                        </Typography>
                      ))}
                      <Typography className="text-gray-400 text-sm">
                        {new Date(submission.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleViewEntry(submission.id)}
                    >
                      View Details
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Typography className="text-gray-400">
                No submissions found.
              </Typography>
              <Button
                onClick={handleAddEntry}
                className="bg-green-500 hover:bg-green-600"
              >
                Create First Entry
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default FormList;
