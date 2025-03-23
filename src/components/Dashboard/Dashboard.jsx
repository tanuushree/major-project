import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Select,
  Option,
  Button,
  Spinner,
} from "@material-tailwind/react";
import {
  DocumentIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ChartBarIcon,
  TableCellsIcon,
} from "@heroicons/react/24/solid";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Sidebar } from './Sidebar';
import { formService } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function Dashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [timePeriod, setTimePeriod] = useState("Last 30 days");
  const [chartView, setChartView] = useState("Monthly");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Get all forms for the project
        const formsData = await formService.getForms(projectId);
        setForms(formsData);
        
        // Get submissions for each form
        const allSubmissions = [];
        for (const form of formsData) {
          const formSubmissions = await formService.getFormSubmissions(form._id);
          allSubmissions.push(...formSubmissions);
        }
        setSubmissions(allSubmissions);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId]);

  const stats = [
    {
      title: "Total Forms",
      value: forms.length || 0,
      icon: <DocumentIcon className="h-6 w-6" />,
    },
    {
      title: "Total Submissions",
      value: submissions.length || 0,
      icon: <ClipboardDocumentListIcon className="h-6 w-6" />,
    },
  ];

  // Updated getChartData function to include forms data
  const getChartData = () => {
    const filterDate = new Date();
    switch (timePeriod) {
      case "Last 30 days":
        filterDate.setDate(filterDate.getDate() - 30);
        break;
      case "Last 90 days":
        filterDate.setDate(filterDate.getDate() - 90);
        break;
      case "Last 180 days":
        filterDate.setDate(filterDate.getDate() - 180);
        break;
      default:
        filterDate.setDate(filterDate.getDate() - 30);
    }

    // Filter submissions based on date
    const filteredSubmissions = submissions.filter(submission => 
      new Date(submission.createdAt) > filterDate
    );

    // Filter forms based on date (assuming forms have a createdAt field)
    const filteredForms = forms.filter(form => 
      new Date(form.createdAt) > filterDate
    );

    // Group by date according to chartView
    const groupedSubmissions = {};
    const groupedForms = {};

    // Helper function to get the key based on date and chartView
    const getKey = (date) => {
      switch (chartView) {
        case "Monthly":
          return `${date.getFullYear()}-${date.getMonth() + 1}`;
        case "Weekly":
          const weekNumber = Math.ceil((date.getDate() + 
            new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          return `Week ${weekNumber}, ${date.getMonth() + 1}/${date.getFullYear()}`;
        case "Daily":
        default:
          return date.toLocaleDateString();
      }
    };

    // Group submissions
    filteredSubmissions.forEach(submission => {
      const date = new Date(submission.createdAt);
      const key = getKey(date);
      groupedSubmissions[key] = (groupedSubmissions[key] || 0) + 1;
    });

    // Group forms
    filteredForms.forEach(form => {
      const date = new Date(form.createdAt);
      const key = getKey(date);
      groupedForms[key] = (groupedForms[key] || 0) + 1;
    });

    // Get all unique dates
    const allDates = [...new Set([...Object.keys(groupedSubmissions), ...Object.keys(groupedForms)])].sort();

    return {
      labels: allDates,
      datasets: [
        {
          label: 'Form Submissions',
          data: allDates.map(date => groupedSubmissions[date] || 0),
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
        },
        {
          label: 'Total Forms',
          data: allDates.map(date => groupedForms[date] || 0),
          backgroundColor: 'rgba(14, 165, 233, 0.5)',
          borderColor: 'rgb(14, 165, 233)',
          borderWidth: 1,
        }
      ],
    };
  };

  // Updated chart options to better handle multiple datasets
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Forms and Submissions Analytics'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 ml-16">
        <div className="p-6">
          <div className="relative">
            <div className="mb-12">
              <div className="mb-8 flex items-center justify-between gap-8">
                <Typography variant="h5" color="blue-gray">
                  Forms Analytics Dashboard
                </Typography>
              </div>

              {/* Time Period Selector */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <div className="w-48">
                  <Select
                    label="Time Period"
                    value={timePeriod}
                    onChange={(value) => setTimePeriod(value)}
                    icon={<CalendarIcon className="h-5 w-5" />}
                  >
                    <Option value="Last 30 days">Last 30 days</Option>
                    <Option value="Last 90 days">Last 90 days</Option>
                    <Option value="Last 180 days">Last 180 days</Option>
                  </Select>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                {stats.map((stat) => (
                  <Card key={stat.title} className="border border-blue-gray-100 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-100 p-2">
                          {stat.icon}
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {stat.title}
                          </Typography>
                          <Typography variant="h4" color="blue-gray" className="font-semibold">
                            {stat.value}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Chart */}
            <Card className="border border-blue-gray-100 shadow-sm">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <Typography variant="h6" color="blue-gray">
                    Forms and Submissions Analytics
                  </Typography>
                  <div className="flex items-center gap-4">
                    <Select
                      value={chartView}
                      onChange={(value) => setChartView(value)}
                      className="min-w-[100px]"
                    >
                      <Option value="Monthly">Monthly</Option>
                      <Option value="Weekly">Weekly</Option>
                      <Option value="Daily">Daily</Option>
                    </Select>
                  </div>
                </div>
                <div className="h-[400px]">
                  <Bar data={getChartData()} options={chartOptions} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 