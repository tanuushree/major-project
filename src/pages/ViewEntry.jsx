import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Typography, Button, Card, Spinner, Alert } from "@material-tailwind/react";
import { formService } from "../services/api";

function ViewEntry() {
  const { projectName: encodedProjectName, formId, submissionId } = useParams();
  const projectName = decodeURIComponent(encodedProjectName);
  const location = useLocation();
  const navigate = useNavigate();
  const formName = location.state?.formName || "Form";

  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        setLoading(true);
        const response = await formService.getSubmissionById(submissionId);
        console.log('Submission data:', response);
        setSubmissionData(response);
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError('Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmissionData();
    }
  }, [submissionId]);

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
              {formName} - Entry Details
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
          <Alert color="red" dismissible={{ onClose: () => setError(null) }}>
            {error}
          </Alert>
        )}

        <Card className="bg-gray-800 p-6">
          {submissionData && (
            <div className="space-y-4">
              {Object.entries(submissionData).map(([fieldName, value], index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <Typography className="text-gray-400 text-sm">
                    {fieldName}
                  </Typography>
                  <Typography className="text-white">
                    {value || 'N/A'}
                  </Typography>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ViewEntry; 