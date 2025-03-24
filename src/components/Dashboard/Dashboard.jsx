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
  const [stats, setStats] = useState({
    totalForms: 0,
    totalSubmissions: 0,
    submissionsToday: 0,
    averageSubmissionsPerForm: 0,
    activeFormCount: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Get all forms for the project
        const formsData = await formService.getFormsByProjectId(projectId);
        setForms(formsData);
        
        // Get submissions for each form
        const allSubmissions = [];
        for (const form of formsData) {
          const formSubmissions = await formService.getFormSubmissions(form.id);
          allSubmissions.push(...formSubmissions);
        }
        setSubmissions(allSubmissions);

        // Calculate additional statistics
        const today = new Date().toISOString().split('T')[0];
        const submissionsToday = allSubmissions.filter(sub => 
          sub.createdAt.startsWith(today)
        ).length;

        const averageSubmissionsPerForm = formsData.length ? 
          (allSubmissions.length / formsData.length).toFixed(2) : 0;

        // Count forms with submissions in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeFormCount = formsData.filter(form => 
          allSubmissions.some(sub => 
            new Date(sub.createdAt) > thirtyDaysAgo && 
            sub.form_id === form.id
          )
        ).length;

        setStats({
          totalForms: formsData.length,
          totalSubmissions: allSubmissions.length,
          submissionsToday,
          averageSubmissionsPerForm,
          activeFormCount
        });

      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId]);

  const statsCards = [
    {
      title: "Total Forms",
      value: stats.totalForms,
      icon: <DocumentIcon className="h-6 w-6" />,
    },
    {
      title: "Total Submissions",
      value: stats.totalSubmissions,
      icon: <ClipboardDocumentListIcon className="h-6 w-6" />,
    },
    {
      title: "Submissions Today",
      value: stats.submissionsToday,
      icon: <CalendarIcon className="h-6 w-6" />,
    },
    {
      title: "Active Forms",
      value: stats.activeFormCount,
      icon: <ChartBarIcon className="h-6 w-6" />,
      description: "Forms with submissions in last 30 days"
    },
    {
      title: "Avg Submissions/Form",
      value: stats.averageSubmissionsPerForm,
      icon: <TableCellsIcon className="h-6 w-6" />,
    },
  ];

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

    // Filter and sort submissions by date
    const filteredSubmissions = submissions
      .filter(submission => new Date(submission.createdAt) > filterDate)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Group by date according to chartView
    const submissionsByDate = {};
    let cumulativeCount = 0;

    const getKey = (date) => {
      switch (chartView) {
        case "Monthly":
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        case "Weekly":
          const weekNumber = Math.ceil((date.getDate() + 
            new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          return `Week ${weekNumber}, ${date.getMonth() + 1}/${date.getFullYear()}`;
        case "Daily":
        default:
          return date.toISOString().split('T')[0];
      }
    };

    // Calculate cumulative submissions
    filteredSubmissions.forEach(submission => {
      const date = new Date(submission.createdAt);
      const key = getKey(date);
      
      if (!submissionsByDate[key]) {
        submissionsByDate[key] = cumulativeCount;
      }
      cumulativeCount += 1;
      submissionsByDate[key] = cumulativeCount;
    });

    // Create an array of dates between filter date and now
    const dates = [];
    const currentDate = new Date(filterDate);
    const endDate = new Date();
    
    while (currentDate <= endDate) {
      const key = getKey(currentDate);
      dates.push(key);
      
      switch (chartView) {
        case "Monthly":
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case "Weekly":
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case "Daily":
          currentDate.setDate(currentDate.getDate() + 1);
          break;
      }
    }

    // Fill in missing dates with previous cumulative count
    let lastCount = 0;
    const completeData = dates.map(date => {
      if (submissionsByDate[date] !== undefined) {
        lastCount = submissionsByDate[date];
      }
      return {
        date,
        count: lastCount
      };
    });

    return {
      labels: completeData.map(item => item.date),
      datasets: [
        {
          label: 'Total Submissions',
          data: completeData.map(item => item.count),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Cumulative Submissions Growth'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Total Submissions: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Submissions'
        }
      },
      x: {
        title: {
          display: true,
          text: chartView
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // Update the getFormSubmissionsData function to use form names from forms data
  const getFormSubmissionsData = () => {
    // Create a map of form titles and their submission counts
    const formSubmissionCounts = forms.map(form => {
      const submissionCount = submissions.filter(sub => sub.form_id === form.id).length;
      return {
        title: form.name || 'Untitled Form',
        count: submissionCount,
        id: form.id
      };
    });

    // Sort by submission count in descending order
    formSubmissionCounts.sort((a, b) => b.count - a.count);

    console.log('Form submission data:', formSubmissionCounts); // Debug log

    return {
      labels: formSubmissionCounts.map(form => form.title),
      datasets: [
        {
          label: 'Submissions per Form',
          data: formSubmissionCounts.map(form => form.count),
          backgroundColor: 'rgba(14, 165, 233, 0.5)',
          borderColor: 'rgb(14, 165, 233)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Update bar chart options to handle longer form names
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Submissions by Form'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Submissions: ${context.parsed.y}`;
          },
          title: function(context) {
            return context[0].label || 'Untitled Form';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Submissions'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Forms'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            // Truncate long form names
            return label.length > 20 ? label.substr(0, 17) + '...' : label;
          }
        }
      }
    }
  };

  // Add these new chart functions

  // 1. Time of Day Analysis
  const getTimeOfDayData = () => {
    const hourlySubmissions = new Array(24).fill(0);
    
    submissions.forEach(submission => {
      const hour = new Date(submission.createdAt).getHours();
      hourlySubmissions[hour]++;
    });

    return {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      datasets: [{
        label: 'Submissions by Hour',
        data: hourlySubmissions,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }]
    };
  };

  // 2. Weekly Pattern Analysis
  const getWeeklyPatternData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daySubmissions = new Array(7).fill(0);
    
    submissions.forEach(submission => {
      const day = new Date(submission.createdAt).getDay();
      daySubmissions[day]++;
    });

    return {
      labels: days,
      datasets: [{
        label: 'Submissions by Day of Week',
        data: daySubmissions,
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1
      }]
    };
  };

  // 3. Form Completion Time Analysis (if you have start/end time data)
  const getCompletionTimeData = () => {
    const timeRanges = ['0-1 min', '1-3 min', '3-5 min', '5-10 min', '10+ min'];
    // This is mock data - replace with actual completion time calculation
    const completionTimes = [10, 25, 30, 20, 15];

    return {
      labels: timeRanges,
      datasets: [{
        label: 'Form Completion Time Distribution',
        data: completionTimes,
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }]
    };
  };

  // 4. Recent Activity Timeline
  const getRecentActivityData = () => {
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return {
      labels: recentSubmissions.map(sub => 
        new Date(sub.createdAt).toLocaleDateString()
      ),
      datasets: [{
        label: 'Recent Submissions',
        data: recentSubmissions.map(() => 1),
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 1
      }]
    };
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statsCards.map((stat) => (
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
                          {stat.description && (
                            <Typography variant="small" color="gray" className="font-normal">
                              {stat.description}
                            </Typography>
                          )}
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
                  <Line data={getChartData()} options={chartOptions} />
                </div>
              </div>
            </Card>

            {/* Add spacing between charts */}
            <div className="mb-8"></div>

            {/* New Bar Chart */}
            <Card className="border border-blue-gray-100 shadow-sm">
              <div className="p-6">
                <div className="mb-6">
                  <Typography variant="h6" color="blue-gray">
                    Submissions by Form
                  </Typography>
                </div>
                <div className="h-[400px]">
                  <Bar 
                    data={getFormSubmissionsData()} 
                    options={barChartOptions} 
                  />
                </div>
              </div>
            </Card>

            {/* New Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Time of Day Analysis */}
              <Card className="border border-blue-gray-100 shadow-sm">
                <div className="p-6">
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Submission Time Patterns
                  </Typography>
                  <div className="h-[300px]">
                    <Bar data={getTimeOfDayData()} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: { display: true, text: 'Submissions by Hour of Day' }
                      }
                    }} />
                  </div>
                </div>
              </Card>

              {/* Weekly Pattern Analysis */}
              <Card className="border border-blue-gray-100 shadow-sm">
                <div className="p-6">
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Weekly Submission Patterns
                  </Typography>
                  <div className="h-[300px]">
                    <Bar data={getWeeklyPatternData()} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: { display: true, text: 'Submissions by Day of Week' }
                      }
                    }} />
                  </div>
                </div>
              </Card>

              {/* Form Completion Time */}
              <Card className="border border-blue-gray-100 shadow-sm">
                <div className="p-6">
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Form Completion Time
                  </Typography>
                  <div className="h-[300px]">
                    <Bar data={getCompletionTimeData()} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: { display: true, text: 'Time Spent on Forms' }
                      }
                    }} />
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="border border-blue-gray-100 shadow-sm">
                <div className="p-6">
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Recent Activity
                  </Typography>
                  <div className="h-[300px]">
                    <Bar data={getRecentActivityData()} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: { display: true, text: 'Latest Submissions' }
                      },
                      scales: {
                        y: {
                          display: false
                        }
                      }
                    }} />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 