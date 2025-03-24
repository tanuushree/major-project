import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Typography, Button, Card, Spinner, Alert, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { formService, submissionService } from "../services/api";
import { CloudArrowDownIcon, PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

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

  const handleDownload = async (formId, format) => {
    try {
      const response = await submissionService.getFormSubmissions(formId, format);
      let blob;
      let filename;
      
      if (format === 'csv') {
        const headers = Object.keys(response[0]?.data || {}).join(',');
        const rows = response.map(submission => 
          Object.values(submission.data).join(',')
        ).join('\n');
        const csvContent = `${headers}\n${rows}`;
        
        blob = new Blob([csvContent], { type: 'text/csv' });
        filename = `form_${formId}_submissions.csv`;
      } else {
        const jsonContent = JSON.stringify(response, null, 2);
        blob = new Blob([jsonContent], { type: 'application/json' });
        filename = `form_${formId}_submissions.json`;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download successful!');
    } catch (error) {
      console.error('Error downloading submissions:', error);
      toast.error('Failed to download submissions');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Spinner className="h-12 w-12" color="white" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="absolute inset-0 bg-[url('/img/sigin.jpeg')] opacity-10 bg-cover bg-center" />
      <div className="relative pt-28 px-6 lg:px-28 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <Typography variant="h3" className="text-white font-bold mb-2">
              {formName}
            </Typography>
            <Typography variant="small" className="text-gray-400">
              {submissions.length} {submissions.length === 1 ? 'Entry' : 'Entries'}
            </Typography>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleAddEntry}
              className="bg-green-500 hover:bg-green-600 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              Add Entry
            </Button>
            <Menu placement="bottom-end">
              <MenuHandler>
                <Button 
                  variant="outlined"
                  className="flex items-center gap-2 border-white hover:bg-white/10 shadow-lg transform hover:scale-105 transition-all"
                >
                  <CloudArrowDownIcon className="h-4 w-4 text-white" />
                  <span className="text-white">Download</span>
                </Button>
              </MenuHandler>
              <MenuList className="bg-gray-800 border-none">
                <MenuItem
                  onClick={() => handleDownload(formId, 'csv')}
                  className="text-white hover:bg-gray-700"
                >
                  Download as CSV
                </MenuItem>
                <MenuItem
                  onClick={() => handleDownload(formId, 'pdf')}
                  className="text-white hover:bg-gray-700"
                >
                  Download as PDF
                </MenuItem>
              </MenuList>
            </Menu>
            <Button
              onClick={() => navigate(`/project/${encodedProjectName}/form/${formId}`)}
              className="bg-white text-black hover:bg-gray-200 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Form
            </Button>
          </div>
        </div>

        {error && (
          <Alert color="red" className="bg-red-500/10 text-red-500 border border-red-500" dismissible={{ onClose: () => setError(null) }}>
            {error}
          </Alert>
        )}

        <div className="grid gap-4">
          {submissions.length > 0 ? (
            submissions.map((submission) => {
              const data = submission.data || {};
              const fieldEntries = Object.entries(data);
              const firstTwoFields = fieldEntries.slice(0, 2);

              return (
                <div
                  key={submission.id}
                  className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all shadow-xl"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      {firstTwoFields.map(([fieldName, value], index) => (
                        <div key={fieldName} className="space-y-1">
                          <Typography className="text-gray-400 text-sm">
                            {fieldName}
                          </Typography>
                          <Typography className={index === 0 ? "text-white text-lg font-medium" : "text-gray-300"}>
                            {value}
                          </Typography>
                        </div>
                      ))}
                      <Typography className="text-gray-500 text-sm">
                        {new Date(submission.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                    <div className="flex items-center">
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 shadow-lg transform hover:scale-105 transition-all w-full md:w-auto"
                        onClick={() => handleViewEntry(submission.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50">
              <Typography className="text-gray-400 mb-4">
                No submissions found.
              </Typography>
              <Button
                onClick={handleAddEntry}
                className="bg-green-500 hover:bg-green-600 shadow-lg transform hover:scale-105 transition-all"
              >
                Create First Entry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormList;