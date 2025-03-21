import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Select,
  Option,
  Button,
} from "@material-tailwind/react";
import {
  UsersIcon,
  EyeIcon,
  Square3Stack3DIcon,
  CursorArrowRaysIcon,
  CalendarIcon,
  ChartBarIcon,
  TableCellsIcon,
} from "@heroicons/react/24/solid";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Sidebar } from './Sidebar';
import api from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function Dashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [segment, setSegment] = useState("All Segments");
  const [timePeriod, setTimePeriod] = useState("Last 180 days");
  const [chartView, setChartView] = useState("Monthly");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await api.get(`/projects/${projectId}/analytics`);
        // Update your dashboard data with the response
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleEditClick = () => {
    navigate('/project');
  };

  // Mock data for the dashboard
  const stats = [
    {
      title: "Active Users",
      value: "6,909",
      change: -54.2,
      icon: <UsersIcon className="h-6 w-6" />,
    },
    {
      title: "Unique Opens",
      value: "1,881",
      change: 62.7,
      icon: <EyeIcon className="h-6 w-6" />,
    },
    {
      title: "Live Modules",
      value: "36",
      icon: <Square3Stack3DIcon className="h-6 w-6" />,
    },
    {
      title: "Modules Clicked",
      value: "1,489",
      change: 28.8,
      icon: <CursorArrowRaysIcon className="h-6 w-6" />,
    },
    {
      title: "Click Rate",
      value: "79%",
      change: -20.8,
      icon: <ChartBarIcon className="h-6 w-6" />,
    },
  ];

  // Chart data
  const chartData = {
    labels: ['Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023', 'Jan 2024'],
    datasets: [
      {
        label: 'Unique Opens',
        data: [200, 350, 450, 400, 300, 450],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Modules Clicked',
        data: [180, 300, 400, 350, 250, 400],
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 ml-16">
        <div className="p-6">
          <div className="relative">
            <div className="mb-12">
              <div className="mb-8 flex items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <Typography variant="h5" color="blue-gray">
                    Resource Center
                  </Typography>
                  <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded">
                    Live
                  </span>
                </div>
                <Button 
                  variant="outlined" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={handleEditClick}
                >
                  <span>Edit</span>
                </Button>
              </div>

              <div className="mb-8 flex flex-wrap items-center gap-4">
                <div className="w-48">
                  <Select
                    label="Segment"
                    value={segment}
                    onChange={(value) => setSegment(value)}
                  >
                    <Option value="All Segments">All Segments</Option>
                    <Option value="Segment 1">Segment 1</Option>
                    <Option value="Segment 2">Segment 2</Option>
                  </Select>
                </div>
                <div className="w-48">
                  <Select
                    label="Time Period"
                    value={timePeriod}
                    onChange={(value) => setTimePeriod(value)}
                    icon={<CalendarIcon className="h-5 w-5" />}
                  >
                    <Option value="Last 180 days">Last 180 days</Option>
                    <Option value="Last 90 days">Last 90 days</Option>
                    <Option value="Last 30 days">Last 30 days</Option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                {stats.map((stat) => (
                  <Card key={stat.title} className="border border-blue-gray-100 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {stat.icon && (
                            <div className="rounded-lg bg-gray-100 p-2">
                              {stat.icon}
                            </div>
                          )}
                          <div>
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              {stat.title}
                            </Typography>
                            <Typography variant="h4" color="blue-gray" className="font-semibold">
                              {stat.value}
                            </Typography>
                          </div>
                        </div>
                        {stat.change && (
                          <Typography
                            className={`font-medium ${
                              stat.change > 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {stat.change > 0 ? "+" : ""}
                            {stat.change}%
                          </Typography>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="border border-blue-gray-100 shadow-sm">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <Typography variant="h6" color="blue-gray">
                    Live Performance
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
                    <div className="flex gap-2">
                      <Button 
                        variant="outlined"
                        size="sm"
                        className="p-2"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outlined"
                        size="sm"
                        className="p-2"
                      >
                        <TableCellsIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="h-[400px]">
                  <Line data={chartData} options={chartOptions} />
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