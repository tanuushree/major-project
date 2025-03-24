import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Typography, Button, Card, Spinner, Alert, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { formService, submissionService } from "../services/api";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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
      console.log('Starting download for:', formId, 'format:', format); 

      // Get submissions data for both PDF and CSV
      const submissions = await submissionService.getFormSubmissions(formId);

      if (format === 'pdf') {
        // PDF generation code remains the same
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Submissions Report", 14, 20);
        
        submissions.forEach((submission, index) => {
          const yPosition = 40 + (index * 40);
          
          doc.setFontSize(12);
          doc.text(`Submission ${index + 1}`, 14, yPosition);
          doc.setFontSize(10);
          doc.text(`Submitted on: ${new Date(submission.createdAt).toLocaleString()}`, 14, yPosition + 7);
          
          const data = submission.data || {};
          Object.entries(data).forEach(([key, value], dataIndex) => {
            doc.text(`${key}: ${value}`, 14, yPosition + 14 + (dataIndex * 7));
          });
          
          if (index < submissions.length - 1) {
            doc.line(14, yPosition + 30, 196, yPosition + 30);
          }
          
          if (yPosition > 250 && index < submissions.length - 1) {
            doc.addPage();
          }
        });
        
        doc.save(`form_${formId}_submissions.pdf`);
        toast.success('Download successful: PDF');
        
      } else if (format === 'csv') {
        // Generate CSV from submissions
        const csvRows = [];
        
        // Get all unique fields from all submissions
        const allFields = new Set();
        submissions.forEach(submission => {
          const data = submission.data || {};
          Object.keys(data).forEach(key => allFields.add(key));
        });
        
        // Create header row
        const headers = ['Submission Date', ...Array.from(allFields)];
        csvRows.push(headers.join(','));
        
        // Add data rows
        submissions.forEach(submission => {
          const data = submission.data || {};
          const row = [
            new Date(submission.createdAt).toLocaleString(),
            ...Array.from(allFields).map(field => {
              const value = data[field] || '';
              // Escape quotes and wrap in quotes if contains comma
              return value.toString().includes(',') 
                ? `"${value.replace(/"/g, '""')}"` 
                : value;
            })
          ];
          csvRows.push(row.join(','));
        });
        
        // Create and download CSV file
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `form_${formId}_submissions.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Download successful: CSV');
      }
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      console.error('Error details:', error.message);
      toast.error(`Failed to download ${format.toUpperCase()}: ${error.message}`);
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
            <Menu placement="bottom-end">
              <MenuHandler>
                <Button 
                  variant="outlined"
                  className="flex items-center gap-2 border-white"
                >
                  <CloudArrowDownIcon className="h-4 w-4 text-white" />
                  <span className="text-white">Download</span>
                  
                </Button>
              </MenuHandler>
              <MenuList>
                <MenuItem
                  onClick={() => handleDownload(formId, 'csv')}
                  className="flex items-center gap-2"
                >
                  <span>Download as CSV</span>
                </MenuItem>
                <MenuItem
                  onClick={() => handleDownload(formId, 'pdf')}
                  className="flex items-center gap-2"
                >
                  <span>Download as PDF</span>
                </MenuItem>
              </MenuList>
            </Menu>
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
                    <div className="flex items-center space-x-2">
                      <Button
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() => handleViewEntry(submission.id)}
                      >
                        View Details
                      </Button>
                    </div>
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
